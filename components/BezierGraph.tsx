"use client";

import { useEffect, useRef } from "react";

type Preset = { name: string; p: [number, number, number, number] };

/**
 * Real easing curves used elsewhere on this site — not decorative values.
 * An easing curve is the one object that exists identically in After Effects'
 * graph editor and in CSS, which is the whole point of showing it here.
 */
const PRESETS: Preset[] = [
  { name: "ease-out-expo", p: [0.16, 1, 0.3, 1] },
  { name: "ease-out-quint", p: [0.22, 1, 0.36, 1] },
  { name: "ease-in-out", p: [0.65, 0, 0.35, 1] },
  { name: "ease-out-back", p: [0.34, 1.56, 0.64, 1] },
];

const HOLD = 2.6; // seconds per preset
const MORPH = 1.1; // seconds to travel between them

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function BezierGraph({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;
    let running = true;
    let dpr = 1;

    // Measured via ResizeObserver, not a one-shot on mount: this element is
    // breakpoint-gated, so it can mount at display:none (zero box) and only
    // later gain a size. A single measurement leaves the canvas 0x0 forever.
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (w === 0 || h === 0) return false;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      return true;
    };

    const draw = (time: number) => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;
      ctx.clearRect(0, 0, w, h);

      const pad = 14 * dpr;
      const gx = pad;
      const gy = pad;
      const gw = w - pad * 2;
      const gh = h - pad * 2;

      // Which preset, and how far into the morph
      const cycle = HOLD + MORPH;
      const total = time / cycle;
      const i = Math.floor(total) % PRESETS.length;
      const j = (i + 1) % PRESETS.length;
      const phase = (time % cycle) / cycle;
      const raw = Math.max(0, (phase * cycle - HOLD) / MORPH);
      const t = easeInOut(Math.min(1, raw));

      const a = PRESETS[i].p;
      const b = PRESETS[j].p;
      const c = a.map((v, k) => lerp(v, b[k], t)) as typeof a;

      const X = (u: number) => gx + u * gw;
      const Y = (v: number) => gy + (1 - v) * gh;

      // frame
      ctx.strokeStyle = "rgba(22,19,15,0.10)";
      ctx.lineWidth = 1 * dpr;
      ctx.strokeRect(gx, gy, gw, gh);

      // diagonal reference — linear
      ctx.beginPath();
      ctx.setLineDash([3 * dpr, 4 * dpr]);
      ctx.moveTo(X(0), Y(0));
      ctx.lineTo(X(1), Y(1));
      ctx.strokeStyle = "rgba(22,19,15,0.13)";
      ctx.stroke();
      ctx.setLineDash([]);

      // handles
      ctx.strokeStyle = "rgba(224,122,36,0.34)";
      ctx.beginPath();
      ctx.moveTo(X(0), Y(0));
      ctx.lineTo(X(c[0]), Y(c[1]));
      ctx.moveTo(X(1), Y(1));
      ctx.lineTo(X(c[2]), Y(c[3]));
      ctx.stroke();

      // the curve
      ctx.beginPath();
      ctx.moveTo(X(0), Y(0));
      ctx.bezierCurveTo(X(c[0]), Y(c[1]), X(c[2]), Y(c[3]), X(1), Y(1));
      ctx.strokeStyle = "rgba(47,91,215,0.55)";
      ctx.lineWidth = 1.6 * dpr;
      ctx.stroke();

      // control points
      const dot = (u: number, v: number, fill: string) => {
        ctx.beginPath();
        ctx.arc(X(u), Y(v), 3.2 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      };
      dot(c[0], c[1], "rgba(224,122,36,0.75)");
      dot(c[2], c[3], "rgba(224,122,36,0.75)");
      dot(0, 0, "rgba(22,19,15,0.35)");
      dot(1, 1, "rgba(22,19,15,0.35)");

      // readout — the actual CSS you would paste
      ctx.font = `${10 * dpr}px ui-monospace, "JetBrains Mono", monospace`;
      ctx.fillStyle = "rgba(22,19,15,0.34)";
      ctx.fillText(
        `cubic-bezier(${c.map((v) => v.toFixed(2)).join(", ")})`,
        gx,
        h - 3 * dpr,
      );
    };

    const loop = () => {
      if (!running) return;
      draw(performance.now() / 1000);
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (frame === null && running) frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    };

    const ro = new ResizeObserver(() => {
      if (resize() && reduce.matches) draw(0);
    });
    ro.observe(canvas);

    if (resize() && reduce.matches) draw(0);
    if (!reduce.matches) start();

    const onVis = () => {
      if (document.hidden) stop();
      else if (!reduce.matches) start();
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

    document.addEventListener("visibilitychange", onVis);
    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
