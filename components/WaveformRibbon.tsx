"use client";

import { useEffect, useRef } from "react";
import { createPalette } from "@/lib/cssColor";
import { THEME_SHIFT_MS } from "@/lib/theme";

const BAR_W = 3;
const GAP = 4;

/** Stable pseudo-random per bar, so the shape reads as recorded audio with
 *  real transients rather than a smooth sine. Deterministic: the same bar
 *  index always returns the same value, so the waveform never reshuffles. */
function seeded(i: number) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Audio waveform ribbon — the shape an editor stares at all day.
 *
 * Amplitude is layered sines multiplied by a stable per-bar seed, scrolling
 * horizontally. Scroll velocity feeds a decaying boost, so flicking the page
 * makes it spike and it settles when you stop.
 */
export default function WaveformRibbon() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    let w = 0, h = 0, dpr = 1;
    let running = true;

    // Eased, not re-read on the spot — see createPalette.
    const palette = createPalette(
      { ink: { var: "--watch", fallback: "160,86,35" } },
      {
        duration: THEME_SHIFT_MS,
        onChange: () => {
          if (reduce.matches) draw(0); // static frame needs an explicit repaint
        },
      },
    );

    let lastY = window.scrollY;
    let boost = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = Math.round(r.width * dpr);
      h = Math.round(r.height * dpr);
      canvas.width = w;
      canvas.height = h;
    };

    const draw = (t: number) => {
      const { ink } = palette.frame();
      ctx.clearRect(0, 0, w, h);

      const mid = h / 2;
      const step = (BAR_W + GAP) * dpr;
      const count = Math.ceil(w / step) + 2;
      const drift = (t * 26 * dpr) % step;

      for (let n = 0; n < count; n++) {
        const x = n * step - drift;
        // Index in "tape" space so the pattern travels with the drift.
        const i = n + Math.floor((t * 26 * dpr) / step);

        const envelope =
          0.55 +
          0.45 * Math.sin(i * 0.021 + t * 0.35) * Math.sin(i * 0.007 - t * 0.2);
        const transient = 0.25 + 0.75 * seeded(i);
        const detail = 0.6 + 0.4 * Math.sin(i * 0.34 + t * 1.1);

        const amp =
          envelope * transient * detail * (0.62 + boost * 0.85) * (h * 0.94);
        const half = Math.max(1 * dpr, amp / 2);

        // Fade toward both edges so the ribbon has no hard ends.
        const p = x / w;
        const edge = Math.min(1, Math.min(p, 1 - p) / 0.16);
        const alpha = 0.42 * Math.max(0, edge);
        if (alpha <= 0.001) continue;

        ctx.fillStyle = `rgba(${ink},${alpha.toFixed(3)})`;
        ctx.fillRect(x, mid - half, BAR_W * dpr, half * 2);
      }
    };

    const loop = () => {
      if (!running) return;
      boost *= 0.94; // decay the scroll kick
      draw(performance.now() / 1000);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (frame !== null || !running) return;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    resize();
    if (reduce.matches) draw(0);
    else start();

    const onScroll = () => {
      const y = window.scrollY;
      const d = Math.abs(y - lastY);
      lastY = y;
      boost = Math.min(1.2, boost + d * 0.012);
    };
    const onResize = () => {
      resize();
      if (reduce.matches) draw(0);
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reduce.matches) start();
    };
    const onMotion = () => {
      stop();
      if (reduce.matches) draw(0);
      else start();
    };

    const io = new IntersectionObserver(
      ([e]) => {
        running = e.isIntersecting;
        if (!running) stop();
        else if (!reduce.matches && !document.hidden) start();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onMotion);

    return () => {
      stop();
      palette.dispose();
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-x-0 z-[2] h-[170px] w-full"
      style={{ bottom: "2%" }}
    />
  );
}
