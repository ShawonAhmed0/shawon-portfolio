import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import SiteNav from "@/components/SiteNav";
import Timecode from "@/components/Timecode";
import { getProject, projects } from "@/content/projects";
import { pageMarks, site } from "@/content/site";

const PAD = "px-5 sm:px-8 md:px-12 lg:px-16";
const MARK = pageMarks.project;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: site.title };
  return {
    title: `${project.name} — ${site.title}`,
    description: project.cardLine,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const accent = project.accent;
  const accentVar = accent === "build" ? "var(--build)" : "var(--watch)";
  const bnBody = project.taglineIsBengali ? "t-bn" : "";

  return (
    <main>
      <SiteNav />

      {/* HEADER */}
      <section
        data-timecode={MARK.header.code}
        data-timecode-label="CASE STUDY"
        className={`pb-16 pt-20 md:pt-28 ${PAD}`}
      >
        <div className="shell">
          <FadeIn onMount>
            <Timecode
              code={MARK.header.code}
              label={MARK.header.label}
              accent={accent}
            />
            <p
              className="font-mono text-[12px] tracking-[0.14em]"
              style={{ color: accentVar }}
            >
              {project.index}
            </p>
            <h1
              className={`t-h2 mt-4 max-w-[18ch] text-[var(--bone)] ${
                project.taglineIsBengali ? "t-bn-display" : ""
              }`}
            >
              {project.name}
            </h1>
            {project.tagline ? (
              <p className={`t-lead mt-6 max-w-[52ch] ${bnBody}`}>
                {project.tagline}
              </p>
            ) : null}
          </FadeIn>

          <FadeIn
            delay={0.1}
            className="mt-12 grid gap-5 md:grid-cols-3"
          >
            {(
              [
                ["ROLE", project.meta.role],
                ["TYPE", project.meta.type],
                ["STACK", project.meta.stack],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="panel tilt p-6 md:p-8"
              >
                <p className="t-label" style={{ color: accentVar }}>
                  {label}
                </p>
                <p className="t-body mt-3" style={{ color: "var(--bone)" }}>
                  {value}
                </p>
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* PROBLEM */}
      <section
        data-timecode={MARK.problem.code}
        data-timecode-label="PROBLEM"
        className={`py-16 md:py-20 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.problem.code}
              label={MARK.problem.label}
              accent={accent}
            />
            <p className="t-lead max-w-[62ch]">{project.problem}</p>
          </FadeIn>
        </div>
      </section>

      {/* SOLUTION */}
      <section
        data-timecode={MARK.solution.code}
        data-timecode-label="SOLUTION"
        className={`py-16 md:py-20 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.solution.code}
              label={MARK.solution.label}
              accent={accent}
            />
            <p className="t-lead max-w-[62ch]">{project.solution}</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.solutionPoints.map((point) => (
                <li
                  key={point}
                  className="panel p-5 text-[13px] font-medium"
                  style={{ color: "var(--bone)" }}
                >
                  {point}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* KEY CHALLENGES */}
      <section
        data-timecode={MARK.challenges.code}
        data-timecode-label="KEY CHALLENGES"
        className={`py-16 md:py-20 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.challenges.code}
              label={MARK.challenges.label}
              accent={accent}
            />
            <ul>
              {project.challenges.map((item, i) => (
                <li
                  key={item}
                  className={`py-5 text-[var(--bone)] ${
                    i > 0 ? "border-t border-[var(--line-soft)]" : ""
                  }`}
                  style={{
                    fontWeight: 500,
                    fontSize: "clamp(1rem, 1.4vw, 1.25rem)",
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* ARCHITECTURE */}
      <section
        data-timecode={MARK.architecture.code}
        data-timecode-label="ARCHITECTURE"
        className={`py-16 md:py-20 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.architecture.code}
              label={MARK.architecture.label}
              accent={accent}
            />
            <p className="t-lead max-w-[62ch]">{project.architecture}</p>
          </FadeIn>
        </div>
      </section>

      {/* MEDIA */}
      <section
        data-timecode={MARK.media.code}
        data-timecode-label="FRAMES"
        className={`py-16 md:py-20 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.media.code}
              label={MARK.media.label}
              accent={accent}
            />
          </FadeIn>
          <FadeIn delay={0.1} className="grid gap-3 md:grid-cols-3">
            {project.media.map((item) => (
              <div
                key={item.src}
                {...(item.playhead ? { "data-playhead": true } : {})}
                className="frame aspect-[4/3] w-full"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </FadeIn>
        </div>
      </section>

      {/* LINKS */}
      <section
        data-timecode={MARK.links.code}
        data-timecode-label="LINKS"
        className={`py-16 md:py-20 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.links.code}
              label={MARK.links.label}
              accent={accent}
            />
            <ul className="flex flex-wrap gap-7">
              {project.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="rule-grow t-h3 inline-block text-[var(--bone)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
