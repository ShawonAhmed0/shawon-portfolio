"use client";

import { useEffect, useRef } from "react";

/**
 * Publishes normalised pointer position as --mx / --my on the hero element.
 * One listener for the whole hero — every floating layer then does its own
 * parallax in CSS, which keeps this off the JS main thread entirely.
 */
export default function HeroFX({ targetId }: { targetId: string }) {
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    if (reduce.matches || !fine.matches) return;

    let tx = 0, ty = 0, cx = 0, cy = 0;

    const tick = () => {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      el.style.setProperty("--mx", cx.toFixed(4));
      el.style.setProperty("--my", cy.toFixed(4));
      raf.current = Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001
        ? requestAnimationFrame(tick)
        : null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (raf.current === null) raf.current = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      tx = 0; ty = 0;
      if (raf.current === null) raf.current = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [targetId]);

  return null;
}
