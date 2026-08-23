import Editor from "@/components/admin/Editor";
import { listMedia, readBundle, storeMode } from "@/lib/admin/store";

/**
 * Always rendered fresh. The content is read from the repository, and a
 * cached copy would show the state before the last publish — which is exactly
 * the window in which someone reloads to check their edit landed.
 */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let bundle;
  try {
    [bundle] = await Promise.all([readBundle()]);
  } catch (cause) {
    // A misconfigured token or repo is the likeliest failure here, and it
    // produces a blank panel with no explanation unless it is caught.
    return (
      <main className="ad-gate">
        <div className="ad-gate-card">
          <h1 className="ad-h">Could not load the content</h1>
          <p className="ad-sub" style={{ marginTop: 12 }}>
            {cause instanceof Error ? cause.message : String(cause)}
          </p>
          <p className="ad-hint" style={{ marginTop: 16 }}>
            Check GITHUB_TOKEN, GITHUB_REPO and GITHUB_BRANCH in the deployment&rsquo;s
            environment variables.
          </p>
        </div>
      </main>
    );
  }

  // Not in the Promise.all above: a failed media listing should degrade to an
  // empty picker, not take the whole panel down with it.
  const library = await listMedia().catch(() => [] as string[]);

  return <Editor initial={bundle} library={library} mode={storeMode()} />;
}
