"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

type Tag =
  | "div" | "section" | "header" | "footer" | "nav"
  | "ul" | "li" | "p" | "span" | "h1" | "h2" | "h3" | "figure";

type FadeInProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  /** Above-the-fold content: play the entrance immediately on load. */
  onMount?: boolean;
  as?: Tag;
  className?: string;
  style?: CSSProperties;
};

/**
 * Progressive enhancement, deliberately.
 *
 * The previous version used whileInView with initial={{opacity:0}}, which
 * shipped `style="opacity:0"` in the server HTML — 20 blocks on the home page
 * were invisible until JS hydrated AND an observer fired. Any hydration hiccup
 * left whole sections blank.
 *
 * Two paths now, neither of which can strand content:
 *   onMount  -> a pure CSS animation. Runs without JS, always completes, and
 *               collapses to the final state under prefers-reduced-motion.
 *   default  -> renders visible on the server; after mount, anything still
 *               below the fold is hidden and revealed on entry.
 */
export default function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  y = 24,
  x = 0,
  onMount = false,
  as = "div",
  className,
  style,
}: FadeInProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const Tag = motion[as] as unknown as typeof motion.div;

  useEffect(() => {
    if (onMount || reduce) return;
    const el = ref.current;
    if (!el) return;

    // Already on screen at mount: leave it visible, never animate it out.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    setHidden(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHidden(false);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onMount, reduce]);

  // CSS-driven entrance — no JS dependency, no SSR opacity:0.
  if (onMount) {
    const Plain = as as "div";
    return (
      <Plain
        className={`rise-in ${className ?? ""}`}
        style={
          {
            ...style,
            "--rise-delay": `${delay}s`,
            "--rise-duration": `${duration}s`,
            "--rise-y": `${y}px`,
            "--rise-x": `${x}px`,
          } as CSSProperties
        }
      >
        {children}
      </Plain>
    );
  }

  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      initial={false}
      animate={hidden ? { opacity: 0, y, x } : { opacity: 1, y: 0, x: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}
