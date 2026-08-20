"use client";

import { useEffect, useState } from "react";

/**
 * Cycles the role line. Every phrase is one Shawon already uses to describe
 * himself — nothing invented. Falls back to the first phrase (and stops
 * cycling) under reduced motion.
 */
export default function RoleCycler({ phrases }: { phrases: string[] }) {
  const [i, setI] = useState(0);
  const [on, setOn] = useState(true);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      setOn(false);
      return;
    }
    const id = setInterval(() => setI((v) => (v + 1) % phrases.length), 2600);
    return () => clearInterval(id);
  }, [phrases.length]);

  if (!on) return <span>{phrases[0]}</span>;

  return (
    <span className="role-slot">
      {phrases.map((p, idx) => (
        <span key={p} className="role-item" data-active={idx === i}>
          {p}
        </span>
      ))}
      {/* Reserves the width of the longest phrase so nothing reflows. */}
      <span aria-hidden className="role-ghost">
        {phrases.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>
    </span>
  );
}
