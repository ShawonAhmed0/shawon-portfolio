import type { CSSProperties } from "react";
import { reelFrames } from "@/content/site";

type Plate = {
  src: string;
  x: number;
  y: number;
  w: number;
  rot: number;
  depth: number;
  delay: number;
  dur: number;
};

/**
 * Reel frames drifting behind the hero like a contact sheet on a lightbox.
 *
 * Deliberately faint — these are texture, not content. Each plate sits on its
 * own parallax depth (reusing the hero's --mx/--my) and its own float cycle,
 * so the field never moves as one flat sheet.
 *
 * Positions avoid the copy column; see FloatingChips for the same reasoning.
 */
const PLATES: Plate[] = [
  { src: reelFrames[0],  x: 58, y: -6, w: 210, rot: -5, depth: 14, delay: 0,   dur: 19 },
  { src: reelFrames[3],  x: 86, y: 34, w: 170, rot: 6,  depth: 26, delay: 2.5, dur: 23 },
  { src: reelFrames[6],  x: 47, y: 74, w: 190, rot: -3, depth: 20, delay: 5,   dur: 21 },
  { src: reelFrames[9],  x: 4,  y: -4, w: 160, rot: 4,  depth: 30, delay: 1.2, dur: 25 },
  { src: reelFrames[11], x: 14, y: 96, w: 150, rot: -7, depth: 18, delay: 3.7, dur: 20 },
];

export default function ContactSheet() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] hidden overflow-hidden lg:block"
    >
      {PLATES.map((p, i) => (
        <span
          key={`${p.src}-${i}`}
          className="sheet-shell absolute"
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              "--depth": p.depth,
            } as CSSProperties
          }
        >
          <span
            className="sheet-drift block"
            style={
              {
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
              } as CSSProperties
            }
          >
            <img
              src={p.src}
              alt=""
              loading="lazy"
              decoding="async"
              className="sheet-plate block"
              style={{ width: `${p.w}px`, rotate: `${p.rot}deg` }}
            />
          </span>
        </span>
      ))}
    </div>
  );
}
