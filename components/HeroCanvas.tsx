"use client";

import { useEffect, useRef } from "react";

type Bloom = {
  rgb: string;
  x: number; y: number;
  ax: number; ay: number;
  sx: number; sy: number;
  ph: number;
  r: number;
  a: number;
};

/* Soft pastel blooms on warm paper. On a light ground these composite
   normally — additive blending would just wash everything to white. */
const BLOOMS: Bloom[] = [
  { rgb: "255,203,140", x: 0.62, y: 0.30, ax: 0.09, ay: 0.06, sx: 0.020, sy: 0.016, ph: 0.0, r: 0.62, a: 0.85 },
  { rgb: "255,178,168", x: 0.80, y: 0.60, ax: 0.07, ay: 0.06, sx: 0.015, sy: 0.023, ph: 1.7, r: 0.52, a: 0.62 },
  { rgb: "198,215,255", x: 0.40, y: 0.72, ax: 0.08, ay: 0.05, sx: 0.018, sy: 0.013, ph: 3.1, r: 0.55, a: 0.55 },
  { rgb: "255,232,190", x: 0.22, y: 0.24, ax: 0.06, ay: 0.05, sx: 0.013, sy: 0.019, ph: 4.6, r: 0.48, a: 0.50 },
];

const PAPER = "#faf7f2";
const SPARKS = 34;

export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    let frame: number | null = null;
    let w = 0, h = 0;
    let running = true;

    // Pointer influence, eased. Target is where the cursor is; cur chases it,
    // so the field drifts rather than snapping.
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };

    // Drifting specks. Warm-tinted rather than white so they read as light in
    // the field instead of dust on the screen.
    const sparks = Array.from({ length: SPARKS }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.7 + Math.random() * 1.7,
      vy: 0.006 + Math.random() * 0.014,
      vx: (Math.random() - 0.5) * 0.006,
      ph: Math.random() * Math.PI * 2,
      sp: 0.5 + Math.random() * 1.1,
    }));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || window.innerWidth;
      const cssH = canvas.clientHeight || window.innerHeight;
      w = Math.min(Math.round(cssW * dpr), 1800);
      h = Math.round(w * (cssH / cssW));
      canvas.width = w;
      canvas.height = h;
    };

    const draw = (t: number) => {
      const diag = Math.hypot(w, h);
      cur.x += (target.x - cur.x) * 0.045;
      cur.y += (target.y - cur.y) * 0.045;
      ctx.fillStyle = PAPER;
      ctx.fillRect(0, 0, w, h);

      for (const b of BLOOMS) {
        // Nearer blooms react more, which reads as depth.
        const pull = 0.06 + b.r * 0.09;
        const cx = (b.x + Math.sin(t * b.sx + b.ph) * b.ax + cur.x * pull) * w;
        const cy = (b.y + Math.cos(t * b.sy + b.ph) * b.ay + cur.y * pull) * h;
        const rad = b.r * diag * 0.5;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        g.addColorStop(0, `rgba(${b.rgb},${b.a})`);
        g.addColorStop(0.5, `rgba(${b.rgb},${b.a * 0.34})`);
        g.addColorStop(1, `rgba(${b.rgb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Flatten the field where the portrait sits. The clip was shot on a
      // cream ground (#f0ece2); against a bright bloom that reads as a
      // rectangle. mix-blend-mode cannot fix it here because the parallax
      // wrapper's transform creates a stacking context and isolates the blend,
      // so instead the backdrop is brought back to near-flat paper there.
      const px = 0.78 * w;
      const py = 0.46 * h;
      const pr = 0.46 * diag * 0.5;
      const wash = ctx.createRadialGradient(px, py, 0, px, py, pr);
      wash.addColorStop(0, "rgba(250,247,242,0.92)");
      wash.addColorStop(0.55, "rgba(250,247,242,0.66)");
      wash.addColorStop(1, "rgba(250,247,242,0)");
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      for (const p of sparks) {
        const yy = (((p.y - t * p.vy) % 1) + 1) % 1;
        const xx = (((p.x + t * p.vx) % 1) + 1) % 1;
        const tw = 0.34 + 0.66 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
        ctx.fillStyle = `rgba(196,142,84,${(0.30 * tw).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(xx * w, yy * h, p.r * (w / 1400) * 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fade back to paper at the edges so the section has no hard seam.
      const fade = ctx.createLinearGradient(0, h * 0.52, 0, h);
      fade.addColorStop(0, "rgba(250,247,242,0)");
      fade.addColorStop(1, "rgba(250,247,242,1)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);
    };

    const loop = () => {
      if (!running) return;
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

    const onResize = () => {
      resize();
      if (reduce.matches) draw(0);
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reduce.matches) start();
    };
    const onMotionChange = () => {
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

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduce.matches) return;
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    if (fine.matches) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }

    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reduce.addEventListener("change", onMotionChange);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduce.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden">
      <canvas ref={ref} className="h-full w-full" />
    </div>
  );
}
