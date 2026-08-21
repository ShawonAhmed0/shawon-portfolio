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

/**
 * Fires whenever the theme changes. The site is dark by default and ignores
 * prefers-color-scheme, so the only signal is data-theme on <html>.
 *
 * Canvas layers resolve their colours once at mount, so without this a theme
 * toggle leaves them painting the previous palette until a reload.
 */
export function watchTheme(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  return () => observer.disconnect();
}


/* ── Palette tweening ───────────────────────────────────────────────────
 * The rest of the page dissolves between themes with a CSS transition.
 * Canvas layers cannot: their colours are strings baked into a paint call, so
 * re-reading a token on theme change makes them the one surface that cuts
 * while everything around them fades. This eases them instead.
 * ─────────────────────────────────────────────────────────────────────── */

type Vec = number[];

/** A token to follow. `scalar` reads a plain number (e.g. "0.78") rather
 *  than a colour, so positions can ride the same clock as the palette. */
export type TokenSpec = { var: string; fallback: string; scalar?: boolean };

/** Smoothstep. Gentle at both ends, which is what a colour shift wants. */
const ease = (x: number) => x * x * (3 - 2 * x);

const toVec = (triplet: string): Vec =>
  triplet.split(",").map((n) => Number(n) || 0);

export type Palette<K extends string> = {
  /** Resolve every colour token for this instant. Call ONCE per frame. */
  frame(): Record<K, string>;
  /** Current value of a `scalar` token. */
  value(key: K): number;
  /** True while a shift is still running. */
  settling(): boolean;
  /** Re-reads every token with no animation. For changes that are not theme
   *  changes at all — a breakpoint-gated token crossing its breakpoint. */
  resync(): void;
  dispose(): void;
};

export function createPalette<K extends string>(
  tokens: Record<K, TokenSpec>,
  opts: { duration?: number; onChange?: () => void } = {},
): Palette<K> {
  const keys = Object.keys(tokens) as K[];

  const read = () => {
    const out = {} as Record<K, Vec>;
    for (const k of keys) {
      const spec = tokens[k];
      out[k] = spec.scalar
        ? [Number(readVar(spec.var, spec.fallback)) || 0]
        : toVec(varRgb(spec.var, spec.fallback));
    }
    return out;
  };

  // Someone who asked for less motion gets the swap, not the animation.
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const duration = reduce ? 0 : (opts.duration ?? 420);

  let from = read();
  let to = from;
  let start = 0;
  let live = false;

  const progress = () => {
    if (!live) return 1;
    if (duration <= 0) return 1;
    const t = (performance.now() - start) / duration;
    if (t >= 1) {
      live = false;
      return 1;
    }
    return ease(t);
  };

  const sample = () => {
    const k = progress();
    const out = {} as Record<K, Vec>;
    for (const key of keys) {
      const a = from[key];
      const b = to[key];
      out[key] = a.map((v, i) => v + (b[i] - v) * k);
    }
    return out;
  };

  const unwatch = watchTheme(() => {
    from = sample(); // retarget from wherever we are, not from the old palette
    to = read();
    start = performance.now();
    live = true;
    opts.onChange?.();
  });

  return {
    frame() {
      const v = sample();
      const out = {} as Record<K, string>;
      for (const key of keys) {
        const c = v[key];
        out[key] = `${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])}`;
      }
      return out;
    },
    value: (key: K) => sample()[key][0],
    settling: () => live,
    resync() {
      from = to = read();
      live = false;
    },
    dispose: unwatch,
  };
}
