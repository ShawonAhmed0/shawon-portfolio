import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { commitFiles, readRepoFile, repoConfig, type FileWrite } from "./github";
import { parseBundle, type ContentBundle } from "./schema";

/**
 * The one place content is read from and written to.
 *
 * Two backends behind one interface. With GITHUB_TOKEN set the store reads
 * and writes the repository over the API, which is how the deployed panel
 * works: a save is a commit and Vercel redeploys. Without a token it reads
 * and writes files on disk, which is how it works under `next dev` — so the
 * panel is usable and testable locally with no secrets at all.
 *
 * Reads always go to the backend, never to the bundled JSON that the rest of
 * the site imports. That distinction matters on the deployed panel: the
 * bundle is frozen at the last build, so opening /admin during a redeploy
 * would load the previous content, and the next save would quietly revert
 * whatever the previous save had just changed.
 */

export const DATA_DIR = "content/data";

const FILES = {
  site: `${DATA_DIR}/site.json`,
  projects: `${DATA_DIR}/projects.json`,
  experience: `${DATA_DIR}/experience.json`,
  services: `${DATA_DIR}/services.json`,
} as const;

/** Uploads may only land in the media folders the site actually serves from. */
const MEDIA_ROOTS = ["public/work/", "public/reel/", "public/me/"];

export type StoreMode = "github" | "local";

export type MediaUpload = { path: string; base64: string };

export type SaveResult = {
  mode: StoreMode;
  changed: string[];
  commit?: { sha: string; url: string };
};

export function storeMode(): StoreMode {
  return repoConfig() === null ? "local" : "github";
}

/** Canonical serialisation. Identical input must produce identical bytes,
 *  or unchanged files would look changed and every save would commit all of
 *  them. Trailing newline included to match what a text editor writes. */
function serialize(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function localPath(repoPath: string): string {
  const root = process.cwd();
  const full = resolve(root, repoPath);
  // Defence in depth. Every caller-supplied path is already checked, but a
  // write that escaped the project root would be the worst possible bug in
  // this file, so it is also checked at the point of the write.
  if (!full.startsWith(resolve(root) + "/")) {
    throw new Error(`Refusing to write outside the project: ${repoPath}`);
  }
  return full;
}

async function readRaw(repoPath: string): Promise<string | null> {
  const cfg = repoConfig();
  if (cfg) return readRepoFile(cfg, repoPath);
  try {
    return await readFile(localPath(repoPath), "utf8");
  } catch {
    return null;
  }
}

export async function readBundle(): Promise<ContentBundle> {
  const [site, projects, experience, services] = await Promise.all([
    readRaw(FILES.site),
    readRaw(FILES.projects),
    readRaw(FILES.experience),
    readRaw(FILES.services),
  ]);

  const missing = Object.entries({ site, projects, experience, services })
    .filter(([, value]) => value === null)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(
      `Missing content file(s): ${missing.join(", ")}. Check GITHUB_REPO and GITHUB_BRANCH point at this project.`,
    );
  }

  // Parsed on the way in as well as on the way out. If a file was hand-edited
  // into a bad shape, the panel should say so on load rather than present
  // half-empty forms that would write the damage back.
  return parseBundle({
    site: JSON.parse(site as string),
    projects: JSON.parse(projects as string),
    experience: JSON.parse(experience as string),
    services: JSON.parse(services as string),
  });
}

function checkMediaPath(path: string): void {
  if (path.includes("..") || path.includes("\\")) {
    throw new Error(`Unsafe media path: ${path}`);
  }
  if (!MEDIA_ROOTS.some((root) => path.startsWith(root))) {
    throw new Error(`Media must be written under ${MEDIA_ROOTS.join(", ")} — got ${path}`);
  }
}

/**
 * Validates, diffs, and writes. Media always writes; JSON only writes when it
 * differs, so re-saving an untouched section is a no-op rather than an empty
 * commit and a pointless rebuild.
 */
export async function saveBundle(
  input: unknown,
  media: MediaUpload[],
  message: string,
): Promise<SaveResult> {
  const next = parseBundle(input);

  const candidates: Array<[string, unknown]> = [
    [FILES.site, next.site],
    [FILES.projects, next.projects],
    [FILES.experience, next.experience],
    [FILES.services, next.services],
  ];

  const writes: FileWrite[] = [];
  for (const [path, value] of candidates) {
    const serialized = serialize(value);
    if ((await readRaw(path)) !== serialized) {
      writes.push({ path, content: serialized, encoding: "utf-8" });
    }
  }

  for (const item of media) {
    checkMediaPath(item.path);
    writes.push({ path: item.path, content: item.base64, encoding: "base64" });
  }

  if (writes.length === 0) return { mode: storeMode(), changed: [] };

  const cfg = repoConfig();

  // A deployed instance with no token would fall through to the disk branch
  // and fail on a read-only filesystem with a bare EROFS. Saying what is
  // actually missing costs one check and saves a confusing bug report.
  if (!cfg && process.env.NODE_ENV === "production") {
    throw new Error(
      "No GITHUB_TOKEN is set on this deployment, so there is nowhere to save to. Add it to the environment variables and redeploy.",
    );
  }

  if (cfg) {
    const commit = await commitFiles(cfg, writes, message);
    return { mode: "github", changed: writes.map((w) => w.path), commit };
  }

  for (const write of writes) {
    const full = localPath(write.path);
    await mkdir(dirname(full), { recursive: true });
    await writeFile(
      full,
      write.encoding === "base64" ? Buffer.from(write.content, "base64") : write.content,
    );
  }
  return { mode: "local", changed: writes.map((w) => w.path) };
}

/** Lists what is already in /public, so the panel can offer existing images
 *  instead of forcing a re-upload of a file the repo already has. */
export async function listMedia(): Promise<string[]> {
  const cfg = repoConfig();
  const roots = MEDIA_ROOTS.map((root) => root.replace(/\/$/, ""));

  if (cfg) {
    const found = await Promise.all(
      roots.map(async (root) => {
        try {
          const raw = await readRepoFile(cfg, root);
          if (!raw) return [];
          const entries = JSON.parse(raw) as Array<{ type: string; path: string }>;
          return entries.filter((e) => e.type === "file").map((e) => `/${e.path.replace(/^public\//, "")}`);
        } catch {
          return [];
        }
      }),
    );
    return found.flat().sort();
  }

  const { readdir } = await import("node:fs/promises");
  const found = await Promise.all(
    roots.map(async (root) => {
      try {
        const names = await readdir(join(process.cwd(), root));
        return names
          .filter((n) => !n.startsWith("."))
          .map((n) => `/${root.replace(/^public\//, "")}/${n}`);
      } catch {
        return [];
      }
    }),
  );
  return found.flat().sort();
}
