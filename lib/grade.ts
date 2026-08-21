/**
 * Live colour grading for the whole page.
 *
 * The grade is a CSS `filter` on a stage wrapper around the page content, so
 * it grades the actual rendered pixels — photographs included — rather than
 * just swapping palette tokens. Grading the portrait is the entire point on a
 * video editor's site; a token swap would leave the one image on the page
 * ungraded.
 *
 * The fixed chrome (timeline, cursor, this panel) sits OUTSIDE the stage and
 * stays neutral, which is also how a real suite works: you grade the picture,
 * not the interface you are grading it with.
 *
 * At NEUTRAL the filter resolves to `none`, so a visitor who never opens the
 * panel pays nothing — no filter, no extra compositing, no repaint cost.
 */

export type LutId = "neutral" | "teal" | "bleach" | "night" | "super8" | "mono";

export type Grade = {
  lut: LutId;
  /** Stops, -1..+1. 0 is unchanged. */
  exposure: number;
  /** -1..+1 around unity. */
  contrast: number;
  /** -1..+1 around unity. */
  saturation: number;
};

export const NEUTRAL: Grade = {
  lut: "neutral",
  exposure: 0,
  contrast: 0,
  saturation: 0,
};

export const LUTS: { id: LutId; name: string; note: string }[] = [
  { id: "neutral", name: "NEUTRAL", note: "As shot" },
  { id: "teal", name: "TEAL/ORANGE", note: "Blockbuster" },
  { id: "bleach", name: "BLEACH BYPASS", note: "Retained silver" },
  { id: "night", name: "DAY FOR NIGHT", note: "Printer lights down" },
  { id: "super8", name: "SUPER 8", note: "Warm, lifted black" },
  { id: "mono", name: "MONO", note: "Panchromatic" },
];

export const STORAGE_KEY = "grade";

/** Fired on window after the grade changes, so canvases can resample. */
export const GRADE_CHANGED = "grade:changed";

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export function isNeutral(g: Grade) {
  return (
    g.lut === "neutral" &&
    g.exposure === 0 &&
    g.contrast === 0 &&
    g.saturation === 0
  );
}

/**
 * Builds the filter chain. The LUT is an SVG filter carrying real per-channel
 * tone curves (feComponentTransfer), which is what makes these read as film
 * looks rather than as hue-rotate: a linear colour matrix cannot move shadows
 * and highlights in opposite directions, and that opposition IS the look.
 */
export function toFilter(g: Grade): string {
  if (isNeutral(g)) return "none";

  const parts: string[] = [];
  if (g.lut !== "neutral") parts.push(`url(#lut-${g.lut})`);

  // Exposure in stops: one stop is a doubling, so this is exponential rather
  // than a linear brightness slide.
  if (g.exposure !== 0) parts.push(`brightness(${2 ** g.exposure})`);
  if (g.contrast !== 0) parts.push(`contrast(${1 + g.contrast * 0.6})`);
  if (g.saturation !== 0) parts.push(`saturate(${1 + g.saturation})`);

  return parts.join(" ") || "none";
}

export function readStored(): Grade {
  if (typeof window === "undefined") return NEUTRAL;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return NEUTRAL;
    const parsed = JSON.parse(raw) as Partial<Grade>;
    return {
      lut: LUTS.some((l) => l.id === parsed.lut)
        ? (parsed.lut as LutId)
        : "neutral",
      exposure: clamp(Number(parsed.exposure) || 0, -1, 1),
      contrast: clamp(Number(parsed.contrast) || 0, -1, 1),
      saturation: clamp(Number(parsed.saturation) || 0, -1, 1),
    };
  } catch {
    return NEUTRAL;
  }
}

export function applyGrade(g: Grade) {
  const root = document.documentElement;
  root.style.setProperty("--grade-filter", toFilter(g));
  root.dataset.graded = isNeutral(g) ? "" : g.lut;

  try {
    if (isNeutral(g)) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(g));
  } catch {
    /* non-fatal: the grade still applies for this page view */
  }

  window.dispatchEvent(new CustomEvent(GRADE_CHANGED, { detail: g }));
}
