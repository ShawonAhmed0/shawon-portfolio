import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Accent, Project } from "@/content/projects";

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
 * Grid card. This replaced a sticky-stacking implementation built for the old
 * dark cinematic layout: four 88vh scroll-pinned panels made the work section
 * 5200px tall, more than half the page. A grid reads faster and matches the
 * reference language.
 */
export default function WorkCard({ project, featured = false }: WorkCardProps) {
  const [cover] = project.media;

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`panel group flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div className="overflow-hidden" style={{ background: "var(--surface-2)" }}>
        <img
          src={cover.src}
          alt={cover.alt}
          loading="lazy"
          decoding="async"
          {...(cover.playhead ? { "data-playhead": true } : {})}
          className={`w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${
            featured ? "aspect-[21/9]" : "aspect-[4/3]"
          }`}
        />
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

        <p
          className={`t-body ${project.taglineIsBengali ? "t-bn" : ""}`}
          style={{ margin: 0 }}
        >
          {project.cardLine}
        </p>

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
          <span
            className="rounded-[var(--pill)] px-3 py-1 text-[11px] font-medium"
            style={{ background: "var(--surface-2)", color: "var(--muted)" }}
          >
            {project.meta.type}
          </span>
        </div>
      </div>
    </Link>
  );
}
