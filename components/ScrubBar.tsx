"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

export default function ScrubBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [code, setCode] = useState("00:00:00:00");
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      frame.current = null;
      const max = document.body.scrollHeight - window.innerHeight;
      const next = max > 0 ? (window.scrollY / max) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, next)));
    };

    const onScroll = () => {
      if (frame.current === null) {
        frame.current = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-timecode]"),
    );
    if (sections.length === 0) return;

    setCode(sections[0].dataset.timecode ?? "00:00:00:00");

    const active = new Set<HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) active.add(el);
          else active.delete(el);
        }
        if (active.size === 0) return;

        // The band can hold two sections when a boundary falls inside it, so
        // resolve to whichever one actually owns the viewport midline.
        const mid = window.innerHeight / 2;
        const onMidline = sections.find((s) => {
          if (!active.has(s)) return false;
          const rect = s.getBoundingClientRect();
          return rect.top <= mid && rect.bottom > mid;
        });
        const current = onMidline ?? sections.find((s) => active.has(s));
        if (current) setCode(current.dataset.timecode ?? "00:00:00:00");
      },
      // A zero-height root (-50%/-50%) never reports an intersection, so keep
      // a thin band around the midline instead.
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 hidden h-[46px] items-center justify-between border-t border-[var(--line)] px-5 backdrop-blur-[10px] sm:flex md:px-12"
      style={{ background: "color-mix(in srgb, var(--ink) 82%, transparent)" }}
    >
      <div
        aria-hidden
        className="absolute left-0 top-0 h-[2px] w-full bg-[var(--line)]"
      >
        <div
          className="relative h-full bg-[var(--bone)]"
          style={{ width: `${progress}%` }}
        >
          <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1/2 bg-[var(--bone)]" />
        </div>
      </div>

      <span className="t-label" style={{ color: "var(--bone)" }}>
        {code}
      </span>
      <span className="t-label">PORTFOLIO / {site.year}</span>
    </div>
  );
}
