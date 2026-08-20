import type { CSSProperties } from "react";

type Chip = {
  label: string;
  accent: "build" | "watch";
  /** % position within the hero */
  x: number;
  y: number;
  /** parallax depth — larger drifts further with the pointer */
  depth: number;
  delay: number;
};

/* Real tools only. These are things Shawon works in, not decoration.
 *
 * Positions avoid two things: the copy column (roughly x 0-50%, y 22-76%) and
 * the role badge, which sits at x 3-24%, y 7-13% and is wider than it looks
 * because the cycler reserves the width of its longest phrase.
 *
 * chips drifting over the headline or body text is noise, not polish. They sit
 * above it, below it, or out by the portrait. Nothing goes past x 86, because
 * a chip anchors from its left edge and parallax can push it another ~30px
 * right before the section clips it.
 */
const CHIPS: Chip[] = [
  { label: "React",      accent: "build", x: 46, y: 4,  depth: 26, delay: 0.0 },
  { label: "Next.js",    accent: "build", x: 30, y: 2,  depth: 16, delay: 0.7 },
  { label: "TypeScript", accent: "build", x: 45, y: 95, depth: 34, delay: 1.4 },
  { label: "Supabase",   accent: "build", x: 26, y: 93, depth: 20, delay: 2.1 },
  { label: "Meta Ads",   accent: "watch", x: 82, y: 7,  depth: 30, delay: 0.4 },
  { label: "UGC",        accent: "watch", x: 88, y: 25, depth: 18, delay: 1.1 },
  { label: "VSL",        accent: "watch", x: 76, y: 90, depth: 24, delay: 1.8 },
];

export default function FloatingChips() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] hidden lg:block">
      {CHIPS.map((c) => (
        <span
          key={c.label}
          className="chip-shell absolute"
          style={
            {
              left: `${c.x}%`,
              top: `${c.y}%`,
              "--depth": c.depth,
            } as CSSProperties
          }
        >
          <span
            className="chip-float"
            style={{ animationDelay: `${c.delay}s` } as CSSProperties}
          >
            <span
              className="chip"
              style={{ "--chip-accent": `var(--${c.accent})` } as CSSProperties}
            >
              <span className="chip-dot" />
              {c.label}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
