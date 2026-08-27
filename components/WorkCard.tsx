"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Accent, Project } from "@/content/projects";
import { real } from "@/lib/placeholder";

const ACCENT_VAR: Record<Accent, string> = {
  build: "var(--build)",
  watch: "var(--watch)",
};

type WorkCardProps = {
  project: Project;
  /** First card spans both columns — gives the grid a focal point. */
  featured?: boolean;
};

/**
 * Grid card whose cover scrubs like footage: the cursor's X position across
 * the image picks the frame, and a filmstrip under it marks where you are.
 *
 * Each project already carries three frames, so this is real scrubbing
 * through the actual media rather than a crossfade dressed up as one.
 *
 * Frames beyond the first stay unfetched until the pointer arrives. They are
 * below the fold and most visitors never hover a given card, so loading all
 * three per project up front would triple this section's image weight to show
 * two thirds of it to nobody.
 */
export default function WorkCard({ project, featured = false }: WorkCardProps) {
  const frames = project.media;
  const [index, setIndex] = useState(0);
  const [armed, setArmed] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);

  const scrub = useCallback(
    (clientX: number) => {
      const el = zoneRef.current;
      if (!el || frames.length < 2) return;
      const rect = el.getBoundingClientRect();
      const ratio = (clientX - rect.left) / rect.width;
      const next = Math.floor(ratio * frames.length);
      setIndex(Math.min(frames.length - 1, Math.max(0, next)));
    },
    [frames.length],
  );

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`panel tilt group flex flex-col overflow-hidden ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div
        ref={zoneRef}
        className="scrub-zone"
        style={{ background: "var(--surface-2)" }}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          setArmed(true);
          scrub(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          scrub(e.clientX);
        }}
        onPointerLeave={() => {
          setArmed(false);
          setIndex(0);
        }}
      >
        {frames.map((frame, i) => (
          <img
            key={frame.src}
            src={armed || i === 0 ? frame.src : undefined}
            alt={i === 0 ? frame.alt : ""}
            aria-hidden={i !== 0 || undefined}
            loading="lazy"
            decoding="async"
            {...(frame.playhead ? { "data-playhead": true } : {})}
            className={`scrub-frame ${featured ? "aspect-[21/9]" : "aspect-video"}`}
            data-shown={i === index || undefined}
          />
        ))}

        {frames.length > 1 ? (
          <div aria-hidden className="scrub-strip" data-armed={armed || undefined}>
            {frames.map((frame, i) => (
              <span
                key={frame.src}
                className="scrub-tick"
                data-on={i === index || undefined}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <h3
            className={`t-h3 text-[var(--bone)] ${
              project.taglineIsBengali ? "t-bn-display" : ""
            }`}
          >
            {project.name}
          </h3>
          <span
            aria-hidden
            className="mt-1 shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            style={{ color: "var(--muted)" }}
          >
            <ArrowUpRight size={18} strokeWidth={1.75} />
          </span>
        </div>

        {real(project.cardLine) ? (
          <p
            className={`t-body ${project.taglineIsBengali ? "t-bn" : ""}`}
            style={{ margin: 0 }}
          >
            {project.cardLine}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <span
            className="rounded-[var(--pill)] px-3 py-1 font-mono text-[10px] tracking-[0.12em]"
            style={{
              background: "var(--surface-2)",
              color: ACCENT_VAR[project.accent],
            }}
          >
            {project.index}
          </span>
          {real(project.meta.type) ? (
            <span
              className="rounded-[var(--pill)] px-3 py-1 text-[11px] font-medium"
              style={{ background: "var(--surface-2)", color: "var(--muted)" }}
            >
              {project.meta.type}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
