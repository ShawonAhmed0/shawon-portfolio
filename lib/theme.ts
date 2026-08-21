export type Theme = "light" | "dark";

/** How long a theme swap takes. Shared by the CSS transitions, the canvas
 *  palette tween and the hero layout flip so they land together. */
export const THEME_SHIFT_MS = 460;

/** How long one hero block takes to leave the frame and come back on the
 *  other side. Longer than the colour shift because it covers the full width
 *  of the viewport twice, not a fade. */
export const HERO_SWAP_MS = 760;

/** Offset between the copy's blocks, so they cascade rather than move as a
 *  slab. Four blocks, so the last one finishes 3 steps after the first. */
export const HERO_SWAP_STAGGER = 55;

/** The whole hero swap, last block included. */
export const HERO_SWAP_TOTAL_MS = HERO_SWAP_MS + HERO_SWAP_STAGGER * 3;

/**
 * Fired on window immediately BEFORE data-theme changes.
 *
 * A MutationObserver cannot drive a layout animation: its callback runs after
 * the attribute is already set, so measuring there gives the new geometry
 * twice and there is nothing to animate from. Anything that needs a "before"
 * measurement listens for this instead.
 */
export const THEME_WILL_CHANGE = "theme:willchange";

let clearShift: ReturnType<typeof setTimeout> | undefined;

/**
 * Applies a theme. Every toggle goes through here so the announcement, the
 * stamp, the transition window and the stored choice cannot drift apart.
 */
export function applyTheme(next: Theme) {
  const root = document.documentElement;

  window.dispatchEvent(new CustomEvent(THEME_WILL_CHANGE));

  // The class carries the transition. It is added in the same style
  // recalculation as the colour change, which is enough for the transition to
  // take: a property animates when the after-change style declares one.
  root.classList.add("theme-shifting");
  root.dataset.theme = next;

  try {
    localStorage.setItem("theme", next);
  } catch {
    /* non-fatal: the theme still applies for this page view */
  }

  clearTimeout(clearShift);
  clearShift = setTimeout(
    () => root.classList.remove("theme-shifting"),
    Math.max(THEME_SHIFT_MS, HERO_SWAP_TOTAL_MS) + 60,
  );
}

/** The theme in effect right now. Dark unless light was explicitly chosen. */
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}
