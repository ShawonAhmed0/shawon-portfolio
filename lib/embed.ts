/**
 * Turns a video link into an embeddable one.
 *
 * The admin panel accepts whatever the user has in their clipboard — the URL
 * from the address bar, a share link, a mobile short link — because asking
 * someone to hand-build an /embed/ URL is exactly the kind of chore the panel
 * exists to remove.
 *
 * Returns null for anything unrecognised rather than guessing. A wrong iframe
 * src renders as a silent black rectangle, which is worse than falling back to
 * the placeholder and showing that nothing is set yet.
 */
export function embedUrl(raw: string): string | null {
  const value = raw.trim();
  if (value.length === 0) return null;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^www\./, "");

  // Already an embed URL from either provider: pass it through untouched.
  if (host === "player.vimeo.com" || (host === "youtube.com" && url.pathname.startsWith("/embed/"))) {
    return url.toString();
  }
  if (host === "youtube-nocookie.com" && url.pathname.startsWith("/embed/")) {
    return url.toString();
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${encodeURIComponent(id)}`;
    // /shorts/ID and /live/ID both embed through the same path.
    const match = url.pathname.match(/^\/(?:shorts|live)\/([\w-]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return null;
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : null;
  }

  if (host === "vimeo.com") {
    // A Vimeo URL can carry an unlisted hash as a second segment, which the
    // player needs as ?h= or the embed 404s.
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts.find((part) => /^\d+$/.test(part));
    if (!id) return null;
    const hash = parts[parts.indexOf(id) + 1];
    return hash
      ? `https://player.vimeo.com/video/${id}?h=${encodeURIComponent(hash)}`
      : `https://player.vimeo.com/video/${id}`;
  }

  return null;
}
