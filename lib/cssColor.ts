/**
 * Canvas takes colour strings, not CSS variables, so anything painted to a
 * canvas has to resolve tokens at runtime. Without this the palette lives in
 * two places and the next theme change silently misses the canvas layers.
 */

/** Reads a custom property off :root. */
export function readVar(name: string, fallback = ""): string {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v || fallback;
}

/** "#aabbcc" -> "170,187,204", ready for rgba(). Passes through rgb() input. */
export function toRgbTriplet(color: string, fallback = "0,0,0"): string {
  const c = color.trim();
  if (!c) return fallback;

  if (c.startsWith("rgb")) {
    const nums = c.match(/[\d.]+/g);
    return nums && nums.length >= 3 ? nums.slice(0, 3).join(",") : fallback;
  }

  let hex = c.replace("#", "");
  if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
  if (hex.length !== 6 || /[^0-9a-f]/i.test(hex)) return fallback;

  const n = parseInt(hex, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

/** Convenience: resolve a token straight to an rgb triplet. */
export function varRgb(name: string, fallback = "0,0,0"): string {
  return toRgbTriplet(readVar(name), fallback);
}
