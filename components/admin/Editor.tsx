"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, LogOut, UploadCloud, RotateCcw } from "lucide-react";
import type { ContentBundle, SiteData } from "@/lib/admin/schema";
import { MAX_UPLOAD_BYTES, formatBytes, type PendingMedia } from "@/lib/admin/media";
import type { StoreMode } from "@/lib/admin/store";
import { MediaProvider } from "./ImageField";
import {
  ContactSection,
  CreativeSection,
  ExperienceSection,
  HomeSection,
  IdentitySection,
  ProjectsSection,
  ServicesSection,
  SoftwareSection,
} from "./sections";

/**
 * The editor shell.
 *
 * One bundle lives in state and every section edits a slice of it. Saving
 * sends the whole thing, which is what makes a publish atomic: content and
 * the images it references land in the same commit, so the site is never
 * deployed pointing at a file that has not been written yet.
 *
 * The baseline is the copy that was loaded. Comparing against it — rather
 * than tracking a dirty flag per field — is what lets the rail mark exactly
 * which sections a publish would touch, and lets an edit that was typed and
 * then undone correctly count as no change at all.
 */

/** Each section names the slice it owns, so "changed" is computed rather than
 *  remembered. Order here is the order in the rail. */
const SECTIONS = [
  { id: "identity", label: "Identity", slice: (b: ContentBundle) => [b.site.site, b.site.portrait, b.site.navLinks] },
  { id: "home", label: "Home", slice: (b: ContentBundle) => [b.site.fork, b.site.bridge] },
  { id: "projects", label: "Projects", slice: (b: ContentBundle) => b.projects },
  { id: "software", label: "Software", slice: (b: ContentBundle) => b.site.engineering },
  { id: "creative", label: "Creative", slice: (b: ContentBundle) => b.site.editing },
  { id: "experience", label: "Timeline", slice: (b: ContentBundle) => b.experience },
  { id: "services", label: "Services", slice: (b: ContentBundle) => b.services },
  { id: "contact", label: "Contact", slice: (b: ContentBundle) => b.site.contact },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

type SaveResponse = {
  ok: boolean;
  mode?: StoreMode;
  changed?: string[];
  commit?: { sha: string; url: string };
  error?: string;
  issues?: string[];
};

export default function Editor({
  initial,
  library,
  mode,
}: {
  initial: ContentBundle;
  library: string[];
  mode: StoreMode;
}) {
  const [bundle, setBundle] = useState<ContentBundle>(initial);
  const [pending, setPending] = useState<PendingMedia[]>([]);
  /* Every image uploaded this session, kept past its publish. The committed
     file is not on the live site until the rebuild lands, so dropping the
     object URL at save time would replace a correct thumbnail with a broken
     one for about a minute. */
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [section, setSection] = useState<SectionId>("identity");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<SaveResponse | null>(null);

  // The loaded copy, serialised once. Kept in a ref because it is a comparison
  // baseline, not something the UI renders — moving it to state would rerender
  // everything each time it is replaced after a save.
  const baseline = useRef(JSON.stringify(initial));

  const serialized = JSON.stringify(bundle);
  const contentDirty = serialized !== baseline.current;
  const dirty = contentDirty || pending.length > 0;

  const changedSections = useMemo(() => {
    const before = JSON.parse(baseline.current) as ContentBundle;
    return new Set(
      SECTIONS.filter(
        (s) => JSON.stringify(s.slice(bundle)) !== JSON.stringify(s.slice(before)),
      ).map((s) => s.id),
    );
    // baseline.current is deliberately part of this: after a save it is
    // replaced, and every dot should clear.
  }, [bundle, serialized]); // eslint-disable-line react-hooks/exhaustive-deps

  const queuedBytes = pending.reduce((sum, item) => sum + item.bytes, 0);
  const tooHeavy = queuedBytes > MAX_UPLOAD_BYTES;

  /* Leaving with unsaved edits loses them — nothing is stored until publish. */
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  const patchSite = useCallback(
    (patch: Partial<SiteData>) =>
      setBundle((b) => ({ ...b, site: { ...b.site, ...patch } })),
    [],
  );

  const media = useMemo(
    () => ({
      add: (item: PendingMedia) => {
        setPending((list) => [...list, item]);
        setPreviews((map) => ({ ...map, [item.publicPath]: item.preview }));
      },
      previewFor: (publicPath: string) => previews[publicPath],
      isQueued: (publicPath: string) =>
        pending.some((item) => item.publicPath === publicPath),
      library,
    }),
    [pending, previews, library],
  );

  async function publish() {
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bundle,
          media: pending.map(({ path, base64 }) => ({ path, base64 })),
        }),
      });
      const data = (await res.json()) as SaveResponse;
      setResult(data);

      if (data.ok) {
        // The saved state becomes the new baseline, which clears every dot
        // and the dirty flag without a reload — a reload here would refetch
        // from a deploy that has not rebuilt yet.
        baseline.current = JSON.stringify(bundle);
        // The object URLs are deliberately not revoked here — see `previews`.
        setPending([]);
        // Forces the recompute of changedSections against the new baseline.
        setBundle((b) => ({ ...b }));
      }
    } catch (cause) {
      setResult({
        ok: false,
        error: cause instanceof Error ? cause.message : "The save request failed.",
      });
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!window.confirm("Discard every unsaved change?")) return;
    // Safe to revoke: a discarded upload is referenced by nothing once the
    // bundle is rolled back to the baseline.
    for (const item of pending) URL.revokeObjectURL(item.preview);
    setPending([]);
    setBundle(JSON.parse(baseline.current) as ContentBundle);
    setResult(null);
  }

  const active = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  return (
    <MediaProvider value={media}>
      <div className="ad-shell">
        <header className="ad-top">
          <strong className="text-[0.95rem] font-semibold tracking-tight">Content editor</strong>
          <span className="ad-mode">{mode === "github" ? "Publishes to GitHub" : "Local files"}</span>
          <span className="ad-top-spacer" />
          <a className="ad-btn ad-btn-ghost" href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={13} /> <span className="hidden sm:inline">View site</span>
          </a>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="ad-btn ad-btn-ghost">
              <LogOut size={13} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </header>

        <div className="ad-body">
          <nav className="ad-rail" aria-label="Sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className="ad-rail-item"
                aria-current={s.id === section}
                onClick={() => setSection(s.id)}
              >
                {changedSections.has(s.id) ? (
                  <span className="ad-dot" aria-label="unsaved changes" />
                ) : null}
                {s.label}
              </button>
            ))}
          </nav>

          <main className="ad-main">
            <h1 className="ad-h">{active.label}</h1>

            {section === "identity" ? <IdentitySection value={bundle.site} onChange={patchSite} /> : null}
            {section === "home" ? <HomeSection value={bundle.site} onChange={patchSite} /> : null}
            {section === "software" ? <SoftwareSection value={bundle.site} onChange={patchSite} /> : null}
            {section === "creative" ? <CreativeSection value={bundle.site} onChange={patchSite} /> : null}
            {section === "contact" ? <ContactSection value={bundle.site} onChange={patchSite} /> : null}
            {section === "projects" ? (
              <ProjectsSection
                value={bundle.projects}
                onChange={(projects) => setBundle((b) => ({ ...b, projects }))}
              />
            ) : null}
            {section === "experience" ? (
              <ExperienceSection
                value={bundle.experience}
                onChange={(experience) => setBundle((b) => ({ ...b, experience }))}
              />
            ) : null}
            {section === "services" ? (
              <ServicesSection
                value={bundle.services}
                onChange={(services) => setBundle((b) => ({ ...b, services }))}
              />
            ) : null}

            {result && !result.ok ? (
              <div className="ad-note" role="alert">
                <p className="ad-error">{result.error ?? "The save was rejected."}</p>
                {result.issues?.length ? (
                  <ul className="ad-issues">
                    {result.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {result?.ok ? (
              <div className="ad-note" role="status">
                {result.changed?.length === 0 ? (
                  <p className="ad-ok">Nothing had changed, so nothing was published.</p>
                ) : (
                  <>
                    <p className="ad-ok">
                      Published {result.changed?.length} file
                      {result.changed?.length === 1 ? "" : "s"}.
                    </p>
                    {result.commit ? (
                      <p style={{ marginTop: 6 }}>
                        Vercel is rebuilding now — the live site updates in about a
                        minute.{" "}
                        <a href={result.commit.url} target="_blank" rel="noreferrer">
                          View the commit
                        </a>
                        .
                      </p>
                    ) : (
                      <p style={{ marginTop: 6 }}>
                        Written to your local files. Commit and push to publish them.
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : null}
          </main>
        </div>

        <div className="ad-save">
          <p className="ad-save-text">
            {tooHeavy ? (
              <span style={{ color: "var(--watch)" }}>
                {formatBytes(queuedBytes)} of images queued — over the{" "}
                {formatBytes(MAX_UPLOAD_BYTES)} limit for one publish. Publish what you
                have, then add the rest.
              </span>
            ) : dirty ? (
              <>
                Unsaved changes
                {pending.length > 0
                  ? ` · ${pending.length} image${pending.length === 1 ? "" : "s"} (${formatBytes(queuedBytes)})`
                  : ""}
              </>
            ) : (
              "No changes"
            )}
          </p>

          {dirty ? (
            <button type="button" className="ad-btn ad-btn-danger" onClick={discard} disabled={saving}>
              <RotateCcw size={13} /> <span className="hidden sm:inline">Discard</span>
            </button>
          ) : null}

          <button
            type="button"
            className="ad-btn ad-btn-primary"
            onClick={publish}
            disabled={!dirty || saving || tooHeavy}
          >
            <UploadCloud size={13} /> {saving ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </MediaProvider>
  );
}
