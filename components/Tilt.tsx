"use client";

import { useEffect } from "react";

/**
 * Gives every `.tilt` element a cursor-tracked 3D tilt and a glare that
 * follows the pointer.
 *
 * One document-level pointermove drives all of them, rather than a listener
 * per card. A work grid plus a fork panel is a dozen subscribers to the same
 * high-frequency event, and each one would be doing its own layout read.
 *
 * Values are written as CSS custom properties and the transform itself lives
 * in the stylesheet, so a card that is also mid-hover or mid-entrance is not
 * fighting an inline transform.
 */

const MAX_DEG = 5;

export default function Tilt() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf: number | null = null;
    let pending: PointerEvent | null = null;
    let engaged = new Set<HTMLElement>();

    const apply = () => {
      raf = null;
      const e = pending;
      if (!e) return;

      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".tilt");
      const next = new Set<HTMLElement>();

      if (el) {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--tilt-x", `${(0.5 - py) * MAX_DEG * 2}deg`);
        el.style.setProperty("--tilt-y", `${(px - 0.5) * MAX_DEG * 2}deg`);
        el.style.setProperty("--glare-x", `${px * 100}%`);
        el.style.setProperty("--glare-y", `${py * 100}%`);
        el.dataset.tilting = "";
        next.add(el);
      }

      for (const prev of engaged) {
        if (next.has(prev)) continue;
        prev.style.removeProperty("--tilt-x");
        prev.style.removeProperty("--tilt-y");
        delete prev.dataset.tilting;
      }
      engaged = next;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pending = e;
      if (raf === null) raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      for (const el of engaged) {
        el.style.removeProperty("--tilt-x");
        el.style.removeProperty("--tilt-y");
        delete el.dataset.tilting;
      }
      engaged = new Set();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
  }, []);

  return null;
}
