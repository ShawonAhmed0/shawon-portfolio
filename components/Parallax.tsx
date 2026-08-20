"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

type ParallaxProps = {
  children: ReactNode;
  /** Pixels this layer lags behind the page as the section scrolls out.
   *  Larger = further back. Negative = moves against the scroll. */
  distance?: number;
  className?: string;
};

/**
 * Scroll-linked depth. Real scroll only — nothing is hijacked, the page still
 * moves exactly as far as the user scrolls it. Layers just travel at
 * different rates so the hero reads as having depth.
 */
export default function Parallax({
  children,
  distance = 60,
  className,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const raw = useTransform(scrollYProgress, [0, 1], [0, distance]);
  // Spring takes the edge off wheel/trackpad quantisation.
  const y = useSpring(raw, { stiffness: 140, damping: 26, mass: 0.35 });

  return (
    <motion.div ref={ref} className={className} style={{ y: reduce ? 0 : y }}>
      {children}
    </motion.div>
  );
}
