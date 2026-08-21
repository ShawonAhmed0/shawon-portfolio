"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { HERO_SWAP_MS, HERO_SWAP_STAGGER, THEME_WILL_CHANGE } from "@/lib/theme";

/**
 * Animates the hero columns trading sides.
 *
 * The end state is CSS (see .hero-grid in globals): from md up the two trade
 * sides with the theme. `order` and `grid-template-columns` are not
 * animatable, so this FLIPs it — measure where things were, let the new
 * layout land, then transform them back and play them to zero. Which side
 * each ends on is not encoded here; the direction falls out of the measured
 * delta, so flipping the CSS is enough to reverse the whole animation.
 *
 * The two columns move differently on purpose. The portrait is the anchor and
 * simply glides across, so the eye has something continuous to hold. The copy
 * leaves through its nearest edge and returns from the opposite one, block by
 * block on a stagger, so the text reads as replaced rather than dragged.
 *
 * Three things this depends on:
 *
 * 1. It listens for THEME_WILL_CHANGE rather than observing the attribute. A
 *    MutationObserver fires after the attribute is already set, so both
 *    measurements would read the new geometry and there would be nothing to
 *    animate from.
 *
 * 2. `fill: "backwards"` holds the pre-swap position during a block's stagger
 *    delay. Without it a delayed block would sit at its new position until its
 *    turn came, which is a visible jump to the far side.
 *
 * 3. The portrait's transform goes on .hero-figure, a plain wrapper. The
 *    Parallax inside it rewrites its own style.transform on every scroll
 *    frame and would overwrite anything set here.
 */

/** Clearance past the edge, so nothing is caught mid-exit on a wide screen. */
const MARGIN = 48;

/** Fractions of the copy's timeline: out by 42%, held blank, back from 52%. */
const OUT_AT = 0.42;
const IN_AT = 0.52;

const EASE_GLIDE = "cubic-bezier(0.65, 0, 0.35, 1)";
const EASE_OUT_OF_FRAME = "cubic-bezier(0.55, 0, 1, 0.45)";
const EASE_INTO_FRAME = "cubic-bezier(0.16, 1, 0.3, 1)";

export default function HeroSwap({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Below md both themes stack the same way, so there is no side to trade.
    const desktop = window.matchMedia("(min-width: 768px)");
    let playing: Animation[] = [];

    const onWillChange = () => {
      if (reduce.matches || !desktop.matches) return;

      const copy = grid.querySelector<HTMLElement>(".hero-copy");
      const figure = grid.querySelector<HTMLElement>(".hero-figure");
      if (!copy || !figure) return;

      // Clear any run still in flight first: a transformed element reports a
      // transformed rect, which would poison the measurement. A swap
      // interrupted this way jumps rather than continuing, which is the right
      // trade for a double-click on the toggle.
      for (const a of playing) a.cancel();
      playing = [];

      const blocks = Array.from(copy.children) as HTMLElement[];
      const before = new Map<HTMLElement, number>();
      for (const el of [figure, ...blocks]) {
        before.set(el, el.getBoundingClientRect().left);
      }

      // Runs after the click handler finishes, so data-theme is set by now.
      // Reading a rect here forces the new layout, giving a real "after".
      queueMicrotask(() => {
        const vw = window.innerWidth;
        const shiftOf = (el: HTMLElement) =>
          (before.get(el) ?? 0) - el.getBoundingClientRect().left;

        const figureShift = shiftOf(figure);
        if (Math.abs(figureShift) < 1) return;

        // The portrait: one continuous glide, never leaves the frame.
        playing.push(
          figure.animate(
            [
              { transform: `translateX(${figureShift}px)` },
              { transform: "translateX(0)" },
            ],
            { duration: HERO_SWAP_MS, easing: EASE_GLIDE, fill: "backwards" },
          ),
        );

        // The copy: out one side, back in on the other, staggered.
        blocks.forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          const shift = shiftOf(el);
          if (Math.abs(shift) < 1) return;

          // It arrived from whichever side it is leaving towards.
          const goingRight = shift < 0;
          const offLeft = -(rect.left + rect.width + MARGIN);
          const offRight = vw - rect.left + MARGIN;

          playing.push(
            el.animate(
              [
                {
                  transform: `translateX(${shift}px)`,
                  opacity: 1,
                  easing: EASE_OUT_OF_FRAME,
                },
                {
                  transform: `translateX(${goingRight ? offLeft : offRight}px)`,
                  opacity: 0,
                  offset: OUT_AT,
                  easing: "linear",
                },
                {
                  transform: `translateX(${goingRight ? offRight : offLeft}px)`,
                  opacity: 0,
                  offset: IN_AT,
                  easing: EASE_INTO_FRAME,
                },
                { transform: "translateX(0)", opacity: 1 },
              ],
              {
                duration: HERO_SWAP_MS,
                delay: i * HERO_SWAP_STAGGER,
                fill: "backwards",
              },
            ),
          );
        });
      });
    };

    window.addEventListener(THEME_WILL_CHANGE, onWillChange);
    return () => {
      window.removeEventListener(THEME_WILL_CHANGE, onWillChange);
      for (const a of playing) a.cancel();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
