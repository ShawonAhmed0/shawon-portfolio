"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Resolves text out of noise when it scrolls into view, the way a frame
 * resolves as a render finishes.
 *
 * The real text is rendered on the server and is what sits in the DOM until
 * the effect runs, so this is decoration over working markup: no JS, no
 * IntersectionObserver, or reduced-motion, and the heading is simply there.
 * Search engines and screen readers only ever see the final string — the
 * scrambled frames are written to a separate aria-hidden layer.
 */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/\\<>*+=-";
const FRAME_MS = 34;
/** Frames each character waits before it starts resolving. */
const STAGGER = 1.6;
/** Frames a character spends scrambling once it starts. */
const SETTLE = 7;

export default function Decode({
  text,
  as: Tag = "span",
  className,
  delay = 0,
}: {
  text: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const [noise, setNoise] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;
    let frame = 0;
    let done = false;

    const run = () => {
      frame += 1;
      let out = "";
      let settled = 0;
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        // Spaces never scramble; a heading that loses its word boundaries
        // reads as a block of noise rather than as text resolving.
        if (ch === " ") {
          out += " ";
          settled += 1;
          continue;
        }
        const startsAt = i * STAGGER;
        if (frame >= startsAt + SETTLE) {
          out += ch;
          settled += 1;
        } else if (frame >= startsAt) {
          out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        } else {
          out += " ";
        }
      }
      if (settled === text.length) {
        setNoise(null);
        done = true;
        return;
      }
      setNoise(out);
      timer = setTimeout(() => {
        raf = requestAnimationFrame(run);
      }, FRAME_MS);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done) return;
        io.disconnect();
        timer = setTimeout(() => {
          raf = requestAnimationFrame(run);
        }, delay);
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, delay]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLHeadingElement>}
      className={className}
      data-decoding={noise !== null || undefined}
    >
      {/* The accessible copy is always the real string. */}
      <span className={noise !== null ? "decode-hidden" : undefined}>
        {text}
      </span>
      {noise !== null ? (
        <span aria-hidden className="decode-noise">
          {noise}
        </span>
      ) : null}
    </Tag>
  );
}
