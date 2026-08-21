"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

/**
 * The page as an edit timeline.
 *
 * This replaces a read-only progress bar. Every [data-timecode] section
 * becomes a clip laid out at its real position in the document, the playhead
 * can be dragged to scrub the page, clips can be clicked to cut to a section,
 * and J / L shuttle between them.
 *
 * Both the clips and the playhead are measured in DOCUMENT space, against a
 * single probe line, never scrollY. Scroll progress runs 0..1 over
 * (scrollHeight - innerHeight) while sections live in 0..scrollHeight, so
 * mixing the two puts the playhead outside the clip it is actually inside —
 * most visibly at the very top and bottom of the page.
 *
 * The probe sits at 30% of the viewport rather than the midline, and jumping
 * parks a section top just under the nav. Those two numbers have to agree: at
 * the midline, jumping to a section shorter than half a viewport lands the
 * probe PAST it, so the timeline highlights the following clip and J / L
 * appear to skip.
 */

type Clip = {
  el: HTMLElement;
  code: string;
  label: string;
  /** Fractions of document height. */
  start: number;
  size: number;
};

/** Where the playhead reads the document, as a fraction of viewport height. */
const PROBE = 0.3;

/** Sticky nav height, so a jumped-to section is not tucked underneath it. */
const NAV = 72;

const readLabel = (el: HTMLElement) =>
  el.dataset.timecodeLabel ??
  el.querySelector("[data-timecode-label]")?.textContent?.trim() ??
  el.id.toUpperCase() ??
  "";

export default function Timeline() {
  const pathname = usePathname();
  const trackRef = useRef<HTMLDivElement>(null);
  const [clips, setClips] = useState<Clip[]>([]);
  const [head, setHead] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const frame = useRef<number | null>(null);

  const measure = useCallback(() => {
    const doc = document.body.scrollHeight;
    if (doc <= 0) return;
    const found = Array.from(
      document.querySelectorAll<HTMLElement>("[data-timecode]"),
    ).map((el) => {
      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      return {
        el,
        code: el.dataset.timecode ?? "00:00:00:00",
        label: readLabel(el),
        start: top / doc,
        size: rect.height / doc,
      };
    });
    setClips(found);
  }, []);

  // Re-measure when the document resizes, not just on mount: images and fonts
  // land after first paint and move every section boundary.
  useEffect(() => {
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(document.body);
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, pathname]);

  useEffect(() => {
    const update = () => {
      frame.current = null;
      const doc = document.body.scrollHeight;
      if (doc <= 0) return;
      const probe = window.scrollY + window.innerHeight * PROBE;
      setHead(Math.min(1, Math.max(0, probe / doc)));
    };
    const onScroll = () => {
      if (frame.current === null) frame.current = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      // Clearing the ref matters as much as cancelling the frame. It is the
      // throttle's "nothing scheduled" flag, and a cancelled id left in it
      // reads as a frame still pending — so after any effect re-run (a route
      // change, or React's dev remount) onScroll would never schedule again
      // and the playhead would freeze wherever it stood.
      frame.current = null;
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  // Which clip owns the playhead right now.
  useEffect(() => {
    const hit = clips.find((c) => head >= c.start && head < c.start + c.size);
    setActive(hit?.code ?? clips[0]?.code ?? null);
  }, [head, clips]);

  const scrubTo = useCallback((clientX: number) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const doc = document.body.scrollHeight;
    // Undo the probe offset so the point under the cursor is the point shown.
    const target = ratio * doc - window.innerHeight * PROBE;
    window.scrollTo({
      top: Math.max(0, target),
      behavior: "instant" as ScrollBehavior,
    });
  }, []);

  useEffect(() => {
    if (!scrubbing) return;
    const onMove = (e: PointerEvent) => scrubTo(e.clientX);
    const onUp = () => setScrubbing(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [scrubbing, scrubTo]);

  const jump = useCallback((clip: Clip) => {
    const top = clip.el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - NAV), behavior: "smooth" });
  }, []);

  // J / L shuttle, the transport keys this metaphor borrows from.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key !== "j" && key !== "l") return;
      const i = clips.findIndex((c) => c.code === active);
      const next = clips[key === "l" ? i + 1 : i - 1];
      if (!next) return;
      e.preventDefault();
      jump(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [clips, active, jump]);

  const shown = clips.find((c) => c.code === (hovered ?? active));

  return (
    <div className="transport" data-scrubbing={scrubbing || undefined}>
      <div className="transport-readout">
        <span className="transport-code">{shown?.code ?? "00:00:00:00"}</span>
        <span className="transport-label">{shown?.label}</span>
      </div>

      <div
        ref={trackRef}
        className="transport-track"
        role="slider"
        tabIndex={0}
        aria-label="Scrub the page"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(head * 100)}
        aria-valuetext={shown ? `${shown.label} ${shown.code}` : undefined}
        onPointerDown={(e) => {
          e.preventDefault();
          setScrubbing(true);
          scrubTo(e.clientX);
        }}
        onKeyDown={(e) => {
          const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
          if (!step) return;
          e.preventDefault();
          window.scrollBy({ top: step * window.innerHeight * 0.4 });
        }}
      >
        {clips.map((clip) => (
          <button
            key={clip.code}
            type="button"
            tabIndex={-1}
            className="transport-clip"
            data-active={clip.code === active || undefined}
            style={{
              left: `${clip.start * 100}%`,
              width: `${clip.size * 100}%`,
            }}
            onPointerEnter={() => setHovered(clip.code)}
            onPointerLeave={() => setHovered(null)}
            onClick={(e) => {
              // The track owns dragging; a click that was a drag must not
              // also fire a jump.
              e.stopPropagation();
              jump(clip);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span className="sr-only">{`${clip.label} ${clip.code}`}</span>
          </button>
        ))}

        <span
          aria-hidden
          className="transport-head"
          style={{ left: `${head * 100}%` }}
        />
      </div>

      <span className="transport-meta">PORTFOLIO / {site.year}</span>
    </div>
  );
}
