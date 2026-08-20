"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

type MarqueeRowProps = {
  items: string[];
  direction?: "left" | "right";
  speedFactor?: number;
};

export default function MarqueeRow({
  items,
  direction = "left",
  speedFactor = 0.25,
}: MarqueeRowProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;

    let frame: number | null = null;

    const update = () => {
      frame = null;
      const wrapEl = wrap.current;
      const trackEl = track.current;
      if (!wrapEl || !trackEl) return;

      const sectionTop = wrapEl.getBoundingClientRect().top + window.scrollY;
      const offset =
        (window.scrollY - sectionTop + window.innerHeight) * speedFactor;

      trackEl.style.transform = `translateX(${
        direction === "left" ? -offset : offset - 200
      }px)`;
    };

    const onScroll = () => {
      if (frame === null) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [direction, speedFactor, reduce]);

  // Tripled so the visible window always sits on a full copy.
  const tiles = [...items, ...items, ...items];

  return (
    <div ref={wrap} className="relative overflow-hidden">
      <div className="w-max -translate-x-1/3">
        <div
          ref={track}
          className="flex w-max gap-3"
          style={{ willChange: "transform" }}
        >
          {tiles.map((src, i) => (
            <div
              key={`${src}-${i}`}
              data-playhead
              className="frame h-[214px] w-[380px] shrink-0"
            >
              <img
                src={src}
                alt=""
                width={380}
                height={214}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
