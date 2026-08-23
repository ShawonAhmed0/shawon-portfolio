/**
 * Placeholder detection.
 *
 * The content ships with `TODO:` markers standing in for copy that has not
 * been written. Rendering them is worse than rendering nothing: a visitor
 * reads "TODO: problem statement for HishabAI", and a crawler indexes it as
 * the page's actual content, which is what thin content looks like to a
 * search engine.
 *
 * So the pages ask these helpers whether a value is real, and skip the
 * heading, the section or the whole block when it is not. The page gets
 * shorter and honest instead of longer and broken, and it repairs itself the
 * moment the real copy is entered in the editor — no code change needed.
 */

const MARKER = /^\s*TODO\b/i;

export function isPlaceholder(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === "" || MARKER.test(value);
}

/** The value if it is real, otherwise null — so callers can `??` a fallback. */
export function real(value: string | null | undefined): string | null {
  return isPlaceholder(value) ? null : value!.trim();
}

/** Drops placeholder entries from a list. An all-placeholder list comes back
 *  empty, which is the signal for the caller to skip its section entirely. */
export function realList(values: readonly (string | null | undefined)[]): string[] {
  return values.filter((v) => !isPlaceholder(v)).map((v) => v!.trim());
}

/**
 * A link target that actually goes somewhere.
 *
 * "#" passes every other check — it is neither empty nor a TODO marker — but
 * it is the placeholder the content ships with, and a button that navigates
 * nowhere is worse than no button at all.
 */
export function realHref(value: string | null | undefined): string | null {
  const href = real(value);
  return href === null || href === "#" ? null : href;
}
