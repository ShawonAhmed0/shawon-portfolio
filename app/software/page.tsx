import { pageMetadata } from "@/lib/seo";
import { real, realHref } from "@/lib/placeholder";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Button from "@/components/Button";
import FadeIn from "@/components/FadeIn";
import SiteNav from "@/components/SiteNav";
import Timecode from "@/components/Timecode";
import { engineering, fork, pageMarks } from "@/content/site";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";

const PAD = "px-5 sm:px-8 md:px-12 lg:px-16";
const MARK = pageMarks.software;

export const metadata: Metadata = pageMetadata({
  path: "/software",
  // The literal phrase people search for. "Software" alone matched nothing a
  // person types; the brand line stays on the page itself.
  title: "Web Developer",
  description: `Shawon Ahmed — ${fork.build.body}`,
});

export default function SoftwarePage() {
  const resumeHref = realHref(engineering.resume.href);
  const softwareExperience = experience.filter((row) => row.accent === "build");

  const buildProjects = projects.filter((p) => p.accent === "build");

  return (
    <main>
      <SiteNav />

      {/* HERO — static, no video, --build accent */}
      <section
        data-timecode={MARK.hero.code}
        data-timecode-label="SOFTWARE"
        className={`ground-build overflow-hidden pb-20 pt-10 md:pt-14 ${PAD}`}
      >
        <div className="shell w-full">
          <FadeIn onMount>
            <Timecode
              code={MARK.hero.code}
              label={MARK.hero.label}
              accent="build"
            />
          </FadeIn>
          <div>
            <h1
              className="t-hero rise-in text-[var(--bone)]"
            >
              {fork.build.heading}
            </h1>
          </div>
          <FadeIn delay={0.2} onMount as="p" className="t-lead mt-8 max-w-[38ch]">
            {fork.build.body}
          </FadeIn>
          <FadeIn
            delay={0.3}
            onMount
            as="p"
            className="mt-6 font-mono text-[12px] tracking-[0.14em]"
            style={{ color: "var(--build)" }}
          >
            {fork.build.stack}
          </FadeIn>
        </div>
      </section>

      {/* ABOUT */}
      <section
        data-timecode={MARK.about.code}
        data-timecode-label="ABOUT"
        className={`py-20 md:py-28 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.about.code}
              label={MARK.about.label}
              accent="build"
            />
          </FadeIn>
          {engineering.about.map((paragraph, i) => (
            <FadeIn
              key={paragraph.slice(0, 24)}
              delay={i * 0.08}
              as="p"
              className="t-lead mt-6 max-w-[68ch] first:mt-0"
            >
              {paragraph}
            </FadeIn>
          ))}
        </div>
      </section>

      {/* SKILLS */}
      <section
        data-timecode={MARK.skills.code}
        data-timecode-label="STACK"
        className={`py-20 md:py-28 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.skills.code}
              label={MARK.skills.label}
              accent="build"
            />
            <div className="ghost-head mb-12">
              <span aria-hidden className="ghost">Stack</span>
              <h2 className="t-h2 text-[var(--bone)]">
                Skills &amp; <span className="t-accent">stack</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {engineering.skills.map((group, i) => (
              <FadeIn
                key={group.group}
                delay={i * 0.06}
                className="panel tilt p-6 md:p-8"
              >
                <p className="t-label" style={{ color: "var(--build)" }}>
                  {group.group}
                </p>
                <ul className="mt-6 space-y-3">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="font-mono text-[13px]"
                      style={{ color: "var(--bone)" }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      {softwareExperience.length > 0 ? (
        <section
          data-timecode={MARK.experience.code}
          data-timecode-label="TIMELINE"
          className={`py-20 md:py-28 ${PAD}`}
        >
          <div className="shell">
            <FadeIn>
              <Timecode
                code={MARK.experience.code}
                label={MARK.experience.label}
                accent="build"
              />
            </FadeIn>

            {softwareExperience.map((row) => (
              <FadeIn
                key={row.title}
                className="grid gap-6 py-10 md:grid-cols-[180px_1fr]"
              >
                <p
                  className="font-mono text-[13px]"
                  style={{ color: "var(--build)" }}
                >
                  {row.period}
                  {row.employment ? (
                    <span className="mt-1 block text-[11px] tracking-[0.1em] text-[var(--faint)] uppercase">
                      {row.employment}
                    </span>
                  ) : null}
                </p>
                <div>
                  <h3 className="t-h3 text-[var(--bone)]">{row.title}</h3>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {row.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-[var(--pill)] px-3 py-1.5 text-[11px] font-medium"
                        style={{
                          color: "var(--muted)",
                          background: "var(--surface-2)",
                        }}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>
      ) : null}

      {/* PROJECTS */}
      <section
        data-timecode={MARK.projects.code}
        data-timecode-label="PROJECTS"
        className={`py-20 md:py-28 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.projects.code}
              label={MARK.projects.label}
              accent="build"
            />
            <div className="ghost-head mb-12">
              <span aria-hidden className="ghost">Work</span>
              <h2 className="t-h2 text-[var(--bone)]">
                Selected <span className="t-accent">projects</span>
              </h2>
            </div>
          </FadeIn>

          <ul className="grid gap-3 md:grid-cols-3">
            {buildProjects.map((project, i) => (
              <FadeIn
                key={project.slug}
                as="li"
                delay={i * 0.06}
                className="panel tilt flex flex-col"
              >
                <div className="aspect-video w-full object-cover">
                  <img
                    src={project.media[0].src}
                    alt={project.media[0].alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p
                    className="font-mono text-[12px] tracking-[0.14em]"
                    style={{ color: "var(--build)" }}
                  >
                    {project.index}
                  </p>
                  <h3
                    className={`t-h3 mt-3 text-[var(--bone)] ${
                      project.taglineIsBengali ? "t-bn-display" : ""
                    }`}
                  >
                    {project.name}
                  </h3>
                  {real(project.cardLine) ? (
                    <p
                      className={`t-body mt-3 ${
                        project.taglineIsBengali ? "t-bn" : ""
                      }`}
                    >
                      {project.cardLine}
                    </p>
                  ) : null}
                  <Button
                    variant="build"
                    href={`/projects/${project.slug}`}
                    icon={
                      <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
                    }
                    className="mt-8 self-start"
                  >
                    Open case study
                  </Button>
                </div>
              </FadeIn>
            ))}
          </ul>
        </div>
      </section>

      {/* RESUME — hidden until a real file is linked. A download button
          that goes to "#" is worse than no button. */}
      {resumeHref ? (
        <section
          data-timecode={MARK.resume.code}
          data-timecode-label="DOCUMENTS"
          className={`py-20 ${PAD}`}
        >
          <div className="shell">
            <FadeIn>
              <Timecode
                code={MARK.resume.code}
                label={MARK.resume.label}
                accent="build"
              />
              <Button variant="build" href={resumeHref}>
                {engineering.resume.label}
              </Button>
              {real(engineering.resume.note) ? (
              <p className="t-label mt-4">{engineering.resume.note}</p>
            ) : null}
            </FadeIn>
          </div>
        </section>
      ) : null}
    </main>
  );
}
