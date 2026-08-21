/**
 * The LUTs themselves: per-channel tone curves as SVG filters.
 *
 * `feComponentTransfer` with `type="table"` is a genuine lookup table — the
 * five values are sampled points on that channel's curve and the filter
 * interpolates between them. This is why these read as film looks: a real
 * grade moves shadows and highlights in OPPOSITE directions (teal in the
 * blacks, orange in the skin), and no single colour matrix or hue-rotate can
 * express that, because a matrix applies the same rotation at every
 * luminance.
 *
 * Server-rendered, zero JS, and inert until a filter references it.
 */
export default function GradeFilters() {
  return (
    <svg
      aria-hidden
      focusable="false"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        {/* Cool shadows, warm highlights — red climbs above the diagonal at
            the top, blue sits above it at the bottom and rolls off early. */}
        <filter id="lut-teal" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.00 0.19 0.45 0.74 1.00" />
            <feFuncG type="table" tableValues="0.02 0.24 0.49 0.75 0.98" />
            <feFuncB type="table" tableValues="0.10 0.34 0.54 0.72 0.92" />
          </feComponentTransfer>
          <feColorMatrix type="saturate" values="1.18" />
        </filter>

        {/* Silver retention: crushed blacks, blown highlights, colour pulled
            most of the way out but not all — the point is that a little
            survives. */}
        <filter id="lut-bleach" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0.34" />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.00 0.08 0.44 0.88 1.00" />
            <feFuncG type="table" tableValues="0.00 0.08 0.45 0.88 1.00" />
            <feFuncB type="table" tableValues="0.00 0.09 0.46 0.87 1.00" />
          </feComponentTransfer>
        </filter>

        {/* Day for night: everything down, blue least, and the highlights
            never reach white — moonlight has no white point. */}
        <filter id="lut-night" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.00 0.09 0.20 0.33 0.48" />
            <feFuncG type="table" tableValues="0.01 0.14 0.29 0.46 0.63" />
            <feFuncB type="table" tableValues="0.05 0.25 0.45 0.66 0.88" />
          </feComponentTransfer>
          <feColorMatrix type="saturate" values="0.78" />
        </filter>

        {/* Reversal stock: lifted black, warm bias, highlights compressed
            rather than clipped. */}
        <filter id="lut-super8" colorInterpolationFilters="sRGB">
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.07 0.32 0.56 0.79 1.00" />
            <feFuncG type="table" tableValues="0.05 0.26 0.48 0.70 0.93" />
            <feFuncB type="table" tableValues="0.03 0.18 0.36 0.55 0.77" />
          </feComponentTransfer>
          <feColorMatrix type="saturate" values="1.1" />
        </filter>

        {/* Panchromatic: luminance weights, not an even average — a red
            sweater and a green one should not land on the same grey. */}
        <filter id="lut-mono" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0.2126 0.7152 0.0722 0 0
                    0      0      0      1 0"
          />
          <feComponentTransfer>
            <feFuncR type="table" tableValues="0.00 0.16 0.47 0.80 1.00" />
            <feFuncG type="table" tableValues="0.00 0.16 0.47 0.80 1.00" />
            <feFuncB type="table" tableValues="0.00 0.16 0.47 0.80 1.00" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
