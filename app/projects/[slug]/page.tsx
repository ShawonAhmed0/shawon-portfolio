import { pageMetadata } from "@/lib/seo";
import { real, realList, realHref } from "@/lib/placeholder";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import SiteNav from "@/components/SiteNav";
import Timecode from "@/components/Timecode";
import { getProject, projects, type Project } from "@/content/projects";
import { pageMarks, site } from "@/content/site";

const PAD = "px-5 sm:px-8 md:px-12 lg:px-16";
const MARK = pageMarks.project;

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

/**
 * The case study's meta description.
 *
 * Falls through the fields most likely to carry a real sentence, then to a
 * plainly factual one. Never returns a TODO marker — a placeholder here is
 * what a search engine prints under the result.
 */
function describeProject(project: Project): string {
  const line =
    real(project.cardLine) ?? real(project.tagline) ?? real(project.solution);
  if (line) return `${project.name} — ${line}`;

  const stack = real(project.meta.stack);
  return stack
    ? `${project.name}, a project by ${site.name}. Built with ${stack}.`
    : `${project.name}, a project by ${site.name}.`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: site.title };
  return pageMetadata({
    path: `/projects/${project.slug}`,
    title: project.name,
    description: describeProject(project),
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const accent = project.accent;
  const accentVar = accent === "build" ? "var(--build)" : "var(--watch)";
  const bnBody = project.taglineIsBengali ? "t-bn" : "";

  /* Resolved once, so each section below can ask a single question: is there
     anything real to show? A section with only placeholder copy is skipped
     rather than rendered with a TODO in it. */
  const tagline = real(project.tagline);
  const problem = real(project.problem);
  const solution = real(project.solution);
  const solutionPoints = realList(project.solutionPoints);
  const challenges = realList(project.challenges);
  const architecture = real(project.architecture);
  const metaRows = (
    [
      ["ROLE", real(project.meta.role)],
      ["TYPE", real(project.meta.type)],
      ["STACK", real(project.meta.stack)],
    ] as [string, string | null][]
  ).filter((row): row is [string, string] => row[1] !== null);
  const links = project.links.filter(
    (link) => real(link.label) && realHref(link.href),
  );

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
            {tagline ? (
              <p className={`t-lead mt-6 max-w-[52ch] ${bnBody}`}>{tagline}</p>
            ) : null}
          </FadeIn>

          {metaRows.length > 0 ? (
            <FadeIn delay={0.1} className="mt-12 grid gap-5 md:grid-cols-3">
              {metaRows.map(([label, value]) => (
                <div key={label} className="panel tilt p-6 md:p-8">
                  <p className="t-label" style={{ color: accentVar }}>
                    {label}
                  </p>
                  <p className="t-body mt-3" style={{ color: "var(--bone)" }}>
                    {value}
                  </p>
                </div>
              ))}
            </FadeIn>
          ) : null}
        </div>
      </section>

      {/* PROBLEM */}
      {problem ? (
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
              <p className="t-lead max-w-[62ch]">{problem}</p>
            </FadeIn>
          </div>
        </section>
      ) : null}

      {/* SOLUTION */}
      {solution || solutionPoints.length > 0 ? (
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
              {solution ? <p className="t-lead max-w-[62ch]">{solution}</p> : null}
              <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {solutionPoints.map((point) => (
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
      ) : null}

      {/* KEY CHALLENGES */}
      {challenges.length > 0 ? (
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
                {challenges.map((item, i) => (
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
      ) : null}

      {/* ARCHITECTURE */}
      {architecture ? (
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
              <p className="t-lead max-w-[62ch]">{architecture}</p>
            </FadeIn>
          </div>
        </section>
      ) : null}

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
            {project.media.map((item, i) => (
              <div
                key={item.src}
                {...(item.playhead ? { "data-playhead": true } : {})}
                className="frame aspect-[4/3] w-full"
              >
                <img
                  src={item.src}
                  alt={real(item.alt) ?? `${project.name} — screenshot ${i + 1}`}
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
      {links.length > 0 ? (
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
                {links.map((link) => (
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
      ) : null}
    </main>
  );
}
