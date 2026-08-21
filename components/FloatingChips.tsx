"use client";

import { useEffect, useRef } from "react";

type Chip = {
  label: string;
  accent: "build" | "watch";
  /** % position within the hero — also the rest position the spring pulls to */
  x: number;
  y: number;
  /** larger drifts further on idle and resists the cursor less */
  depth: number;
  phase: number;
};

/* Real tools only. These are things Shawon works in, not decoration.
 *
 * Positions avoid two things: the copy column (roughly x 0-50%, y 22-76%) and
 * the role badge, which sits at x 3-24%, y 7-13% and is wider than it looks
 * because the cycler reserves the width of its longest phrase.
 *
 * Chips drifting over the headline or body text is noise, not polish. They sit
 * above it, below it, or out by the portrait. Nothing goes past x 86, because
 * a chip anchors from its left edge and displacement can push it another ~30px
 * right before the section clips it.
 */
const CHIPS: Chip[] = [
  { label: "React",      accent: "build", x: 46, y: 4,  depth: 26, phase: 0.0 },
  { label: "Next.js",    accent: "build", x: 30, y: 2,  depth: 16, phase: 0.7 },
  { label: "TypeScript", accent: "build", x: 45, y: 95, depth: 34, phase: 1.4 },
  { label: "Supabase",   accent: "build", x: 26, y: 93, depth: 20, phase: 2.1 },
  { label: "Meta Ads",   accent: "watch", x: 82, y: 7,  depth: 30, phase: 0.4 },
  { label: "UGC",        accent: "watch", x: 88, y: 25, depth: 18, phase: 1.1 },
  { label: "VSL",        accent: "watch", x: 76, y: 90, depth: 24, phase: 1.8 },
];

/** Pixels within which the cursor pushes a chip. */
const REACH = 190;
const PUSH = 62;
/** Spring pulling each chip home. Under-damped, so it overshoots and settles. */
const STIFFNESS = 0.055;
const DAMPING = 0.82;

/**
 * The chips have weight. The cursor shoves them out of the way and a spring
 * drags them back, overshooting slightly before it settles.
 *
 * This replaces a pure-CSS idle float. The idle drift survives as the spring's
 * rest target rather than as a separate animation, so a chip that is being
 * pushed is not also fighting a keyframe for control of its transform.
 *
 * One rAF loop drives all seven, and it only runs while the hero is on screen,
 * the tab is visible, and the visitor has not asked for reduced motion.
 */
export default function FloatingChips() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-chip]"),
    );
    if (nodes.length === 0) return;

    // Position, velocity and the home offset, all in px relative to rest.
    const state = nodes.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    const pointer = { x: -9999, y: -9999 };
    let frame: number | null = null;
    let running = true;

    const step = (t: number) => {
      const time = t / 1000;
      const rect = root.getBoundingClientRect();

      for (let i = 0; i < nodes.length; i++) {
        const chip = CHIPS[i];
        const s = state[i];
        const node = nodes[i];

        // Where this chip rests right now, including its idle drift.
        const driftX = Math.sin(time * 0.5 + chip.phase) * (chip.depth * 0.12);
        const driftY = Math.cos(time * 0.4 + chip.phase) * (chip.depth * 0.16);

        // Cursor repulsion, measured from the chip's actual centre.
        const box = node.getBoundingClientRect();
        const cx = box.left + box.width / 2 - rect.left;
        const cy = box.top + box.height / 2 - rect.top;
        const dx = cx - pointer.x;
        const dy = cy - pointer.y;
        const dist = Math.hypot(dx, dy);

        let targetX = driftX;
        let targetY = driftY;
        if (dist < REACH && dist > 0.01) {
          // Falls off with the square of distance, so the shove is local.
          const force = (1 - dist / REACH) ** 2 * PUSH;
          const lighter = 40 / chip.depth;
          targetX += (dx / dist) * force * lighter;
          targetY += (dy / dist) * force * lighter;
        }

        s.vx = (s.vx + (targetX - s.x) * STIFFNESS) * DAMPING;
        s.vy = (s.vy + (targetY - s.y) * STIFFNESS) * DAMPING;
        s.x += s.vx;
        s.y += s.vy;

        // Lean into the direction of travel — secondary motion is what sells
        // the weight; without it the chips read as sliding decals.
        const tilt = Math.max(-9, Math.min(9, s.vx * 1.6));
        node.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
      }

      frame = requestAnimationFrame(step);
    };

    const start = () => {
      if (frame === null && running) frame = requestAnimationFrame(step);
    };
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = root.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running && !document.hidden) start();
        else stop();
      },
      { threshold: 0 },
    );
    io.observe(root);

    const onVisibility = () => (document.hidden ? stop() : start());

    window.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[5] hidden lg:block"
    >
      {CHIPS.map((c) => (
        <span
          key={c.label}
          data-chip
          className="chip-shell absolute"
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
        >
          <span
            className="chip"
            style={{ "--chip-accent": `var(--${c.accent})` } as React.CSSProperties}
          >
            <span className="chip-dot" />
            {c.label}
          </span>
        </span>
      ))}
    </div>
  );
}
