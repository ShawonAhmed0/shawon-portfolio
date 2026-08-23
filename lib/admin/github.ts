/**
 * Commits content changes back to the repository through GitHub's Git Data
 * API, which Vercel then redeploys from.
 *
 * Contents API would be one call per file, each its own commit — a five-image
 * save would land as six commits and five rebuilds. The Git Data API costs
 * more round trips but builds one tree and moves the branch once, so a save
 * is a single commit and a single deploy.
 *
 * Plain fetch throughout; no SDK.
 */

const API = "https://api.github.com";

export type RepoConfig = { token: string; owner: string; repo: string; branch: string };

/** A file to write. `encoding` marks whether `content` is text or base64 bytes. */
export type FileWrite = { path: string; content: string; encoding: "utf-8" | "base64" };

export class GitHubError extends Error {}

/**
 * Reads the repo settings from the environment. Returns null — rather than
 * throwing — when there is no token, because that is the ordinary local-dev
 * case that makes the store fall back to writing files on disk.
 */
export function repoConfig(): RepoConfig | null {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;

  const slug = process.env.GITHUB_REPO ?? "ShawonAhmed0/shawon-portfolio";
  const [owner, repo] = slug.split("/");
  if (!owner || !repo) {
    throw new GitHubError(`GITHUB_REPO must look like "owner/repo", got "${slug}"`);
  }

  return { token, owner, repo, branch: process.env.GITHUB_BRANCH ?? "main" };
}

async function gh<T>(
  cfg: RepoConfig,
  path: string,
  init?: { method?: string; body?: unknown },
): Promise<T> {
  const res = await fetch(`${API}/repos/${cfg.owner}/${cfg.repo}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    // Next patches fetch with its own cache. Without this, a save would read
    // a stale head sha and build its commit on a parent that has moved.
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    // Surface GitHub's own message: "Bad credentials" and "Resource not
    // accessible by personal access token" are different fixes, and a
    // generic "save failed" hides which one happened.
    throw new GitHubError(
      `GitHub ${res.status} on ${path}${detail ? ` — ${detail.slice(0, 300)}` : ""}`,
    );
  }

  return (await res.json()) as T;
}

/**
 * Fetches one file's contents at the branch head. Returns null for 404 so a
 * not-yet-created file reads as absent rather than as an error.
 */
export async function readRepoFile(cfg: RepoConfig, path: string): Promise<string | null> {
  const res = await fetch(
    `${API}/repos/${cfg.owner}/${cfg.repo}/contents/${encodeURI(path)}?ref=${encodeURIComponent(cfg.branch)}`,
    {
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        // Ask for the bytes directly instead of the JSON envelope, which
        // caps out at 1MB and base64-wraps everything.
        Accept: "application/vnd.github.raw",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    },
  );

  if (res.status === 404) return null;
  if (!res.ok) {
    throw new GitHubError(`GitHub ${res.status} reading ${path}`);
  }
  return res.text();
}

/**
 * Writes every file in one commit and fast-forwards the branch.
 *
 * The ref update is not forced. If someone pushed between the read of the
 * head and this write, GitHub rejects the update rather than discarding their
 * commit, and the caller reports a conflict.
 */
export async function commitFiles(
  cfg: RepoConfig,
  files: FileWrite[],
  message: string,
): Promise<{ sha: string; url: string }> {
  if (files.length === 0) throw new GitHubError("Nothing to commit");

  const ref = await gh<{ object: { sha: string } }>(
    cfg,
    `/git/ref/heads/${encodeURIComponent(cfg.branch)}`,
  );
  const parent = ref.object.sha;

  const head = await gh<{ tree: { sha: string } }>(cfg, `/git/commits/${parent}`);

  const blobs = await Promise.all(
    files.map(async (file) => {
      const blob = await gh<{ sha: string }>(cfg, "/git/blobs", {
        method: "POST",
        body: { content: file.content, encoding: file.encoding },
      });
      return { path: file.path, mode: "100644" as const, type: "blob" as const, sha: blob.sha };
    }),
  );

  const tree = await gh<{ sha: string }>(cfg, "/git/trees", {
    method: "POST",
    body: { base_tree: head.tree.sha, tree: blobs },
  });

  const commit = await gh<{ sha: string; html_url: string }>(cfg, "/git/commits", {
    method: "POST",
    body: { message, tree: tree.sha, parents: [parent] },
  });

  await gh(cfg, `/git/refs/heads/${encodeURIComponent(cfg.branch)}`, {
    method: "PATCH",
    body: { sha: commit.sha, force: false },
  });

  return { sha: commit.sha, url: commit.html_url };
}
