"use client";

import { useEffect, useRef } from "react";
import { createPalette } from "@/lib/cssColor";
import { type HeroPost, createHeroPost } from "@/lib/heroPost";
import { THEME_SHIFT_MS } from "@/lib/theme";

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
const BLOOMS: Omit<Bloom, "rgb">[] = [
  { x: 0.62, y: 0.30, ax: 0.09, ay: 0.06, sx: 0.020, sy: 0.016, ph: 0.0, r: 0.62, a: 0.85 },
  { x: 0.80, y: 0.60, ax: 0.07, ay: 0.06, sx: 0.015, sy: 0.023, ph: 1.7, r: 0.52, a: 0.62 },
  { x: 0.40, y: 0.72, ax: 0.08, ay: 0.05, sx: 0.018, sy: 0.013, ph: 3.1, r: 0.55, a: 0.55 },
  { x: 0.22, y: 0.24, ax: 0.06, ay: 0.05, sx: 0.013, sy: 0.019, ph: 4.6, r: 0.48, a: 0.50 },
];

/** Token names feeding each bloom, resolved at runtime. */
const BLOOM_TOKENS = ["--bloom-1", "--bloom-2", "--bloom-3", "--bloom-1"];

const SPARKS = 34;

export default function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // The field is painted into this buffer, never straight to the screen, so
    // the shader has something to sample. Its resolution is capped lower than
    // the display's: the field is all soft gradients, and the per-frame
    // texture upload is the expensive part of the pass.
    const source = document.createElement("canvas");
    const ctx = source.getContext("2d", { alpha: false });
    if (!ctx) return;

    const post: HeroPost | null = createHeroPost(canvas);
    const blit = post ? null : canvas.getContext("2d", { alpha: false });
    if (!post && !blit) return;

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

    // Eased rather than re-read on the spot: the rest of the page dissolves
    // between themes with a CSS transition and a canvas that snaps would be
    // the one surface that cuts.
    const palette = createPalette(
      {
        paper: { var: "--ink", fallback: "246,248,245" },
        ground: { var: "--portrait-ground", fallback: "244,240,233" },
        spark: { var: "--watch", fallback: "160,86,35" },
        bloom0: { var: BLOOM_TOKENS[0], fallback: "207,230,207" },
        bloom1: { var: BLOOM_TOKENS[1], fallback: "207,230,207" },
        bloom2: { var: BLOOM_TOKENS[2], fallback: "207,230,207" },
        bloom3: { var: BLOOM_TOKENS[3], fallback: "207,230,207" },
        // Rides the same clock as the colours so the pool slides across with
        // the portrait instead of jumping to the other side.
        poolX: { var: "--pool-x", fallback: "0.78", scalar: true },
      },
      {
        duration: THEME_SHIFT_MS,
        onChange: () => {
          if (reduce.matches) present(0); // static frame needs a repaint
        },
      },
    );

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || window.innerWidth;
      const cssH = canvas.clientHeight || window.innerHeight;
      // 1100 through the shader, 1800 without: grain and dispersion are
      // computed per screen pixel, so the buffer only has to carry the
      // gradients and can be cheaper than the surface it ends up on.
      w = Math.min(Math.round(cssW * dpr), post ? 1100 : 1800);
      h = Math.round(w * (cssH / cssW));
      source.width = w;
      source.height = h;
      if (post) post.resize(Math.min(Math.round(cssW * dpr), 1800), Math.round(Math.min(Math.round(cssW * dpr), 1800) * (cssH / cssW)));
      else {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const draw = (t: number) => {
      const c = palette.frame();
      const paper = c.paper;
      const ground = c.ground;
      const spark = c.spark;
      const blooms = BLOOMS.map((b, i) => ({
        ...b,
        rgb: c[`bloom${i}` as "bloom0"],
      }));

      const diag = Math.hypot(w, h);
      cur.x += (target.x - cur.x) * 0.045;
      cur.y += (target.y - cur.y) * 0.045;
      ctx.fillStyle = `rgb(${paper})`;
      ctx.fillRect(0, 0, w, h);

      for (const b of blooms) {
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

      // A pool of --portrait-ground under the subject, so he has something to
      // stand on rather than floating on flat page colour. Its x follows the
      // portrait, which trades sides in light mode.
      const px = palette.value("poolX") * w;
      const py = 0.46 * h;
      const pr = 0.62 * diag * 0.5;
      const wash = ctx.createRadialGradient(px, py, 0, px, py, pr);
      wash.addColorStop(0, `rgba(${ground},1)`);
      wash.addColorStop(0.42, `rgba(${ground},1)`);
      wash.addColorStop(0.68, `rgba(${ground},0.82)`);
      wash.addColorStop(1, `rgba(${ground},0)`);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      for (const p of sparks) {
        const yy = (((p.y - t * p.vy) % 1) + 1) % 1;
        const xx = (((p.x + t * p.vx) % 1) + 1) % 1;
        const tw = 0.34 + 0.66 * (0.5 + 0.5 * Math.sin(t * p.sp + p.ph));
        ctx.fillStyle = `rgba(${spark},${(0.30 * tw).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(xx * w, yy * h, p.r * (w / 1400) * 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // Fade back to paper at the edges so the section has no hard seam.
      const fade = ctx.createLinearGradient(0, h * 0.52, 0, h);
      fade.addColorStop(0, `rgba(${paper},0)`);
      fade.addColorStop(1, `rgba(${paper},1)`);
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);
    };

    // Scroll velocity, normalised and decayed. Dispersion opens up while the
    // page moves and closes as it settles, which is what makes the effect read
    // as a lens reacting rather than as a static filter.
    let vel = 0;
    let lastY = window.scrollY;
    const onScrollVel = () => {
      const dy = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      vel = Math.min(1, vel + dy / 900);
    };
    window.addEventListener("scroll", onScrollVel, { passive: true });

    const present = (t: number) => {
      draw(t);
      if (post) {
        const light =
          document.documentElement.dataset.theme === "light" ? 1 : 0;
        post.render(source, t, vel, light);
      } else if (blit) {
        blit.drawImage(source, 0, 0);
      }
    };

    const loop = () => {
      if (!running) return;
      vel *= 0.9;
      present(performance.now() / 1000);
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
    if (reduce.matches) present(0);
    else start();

    const onResize = () => {
      resize();
      // --pool-x is breakpoint-gated, so crossing md moves the pool with no
      // theme change to observe. Snap rather than slide: nothing here is a
      // user-initiated switch.
      palette.resync();
      if (reduce.matches) present(0);
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (!reduce.matches) start();
    };
    const onMotionChange = () => {
      stop();
      if (reduce.matches) present(0);
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
      window.removeEventListener("scroll", onScrollVel);
      post?.dispose();
      palette.dispose();
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
