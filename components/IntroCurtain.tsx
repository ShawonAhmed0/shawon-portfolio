import { site } from "@/content/site";

/**
 * Opening titles.
 *
 * Deliberately a server component driven entirely by CSS animation, for two
 * reasons:
 *   1. It is in the SSR HTML, so it covers the page on first paint — no flash
 *      of the site before the curtain appears.
 *   2. The animation is `forwards` and ends hidden, so it clears itself even
 *      if JS never runs. A JS-driven overlay that fails to hydrate would trap
 *      the visitor behind a blank screen forever.
 *
 * A blocking script in the layout stamps data-intro="done" before paint on
 * repeat visits, so this plays once per session rather than every navigation.
 * Under prefers-reduced-motion the global duration override collapses it to
 * its end state instantly.
 */
export default function IntroCurtain() {
  const letters = Array.from(site.name);

  return (
    <div className="intro" aria-hidden>
      <div className="intro-panel intro-panel-top" />
      <div className="intro-panel intro-panel-bottom" />

      <div className="intro-name">
        {letters.map((ch, i) => (
          <span
            key={`${ch}-${i}`}
            className="intro-letter"
            style={{ animationDelay: `${0.18 + i * 0.055}s` }}
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>

      <span className="intro-bar" />
    </div>
  );
}
