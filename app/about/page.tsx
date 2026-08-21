import type { Metadata } from "next";
import Button from "@/components/Button";
import FadeIn from "@/components/FadeIn";
import SiteNav from "@/components/SiteNav";
import Timecode from "@/components/Timecode";
import { engineering, editing, pageMarks, site } from "@/content/site";
import { experience } from "@/content/experience";

const PAD = "px-5 sm:px-8 md:px-12 lg:px-16";
const MARK = pageMarks.about;

export const metadata: Metadata = {
  title: `About — ${site.title}`,
  description: site.intro,
};

export default function AboutPage() {
  return (
    <main>
      <SiteNav />

      <section
        data-timecode={MARK.hero.code}
        data-timecode-label="ABOUT"
        className={`pb-20 pt-20 md:pt-28 ${PAD}`}
      >
        <div className="shell">
          <FadeIn onMount>
            <Timecode code={MARK.hero.code} label={MARK.hero.label} />
            <h1 className="t-h2 max-w-[16ch] text-[var(--bone)]">
              {site.role}
            </h1>
          </FadeIn>

          {engineering.about.map((paragraph, i) => (
            <FadeIn
              key={paragraph.slice(0, 24)}
              delay={0.1 + i * 0.08}
              as="p"
              className="t-lead mt-8 max-w-[68ch]"
            >
              {paragraph}
            </FadeIn>
          ))}

          <FadeIn delay={0.3} className="mt-12">
            <p className="t-label">POSITIONING</p>
            <p className="t-lead mt-2">{editing.positioning}</p>
          </FadeIn>
        </div>
      </section>

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
            />
          </FadeIn>

          {experience.map((row, i) => (
            <FadeIn
              key={row.title}
              delay={i * 0.05}
              className={`grid gap-6 py-10 md:grid-cols-[180px_1fr] ${
                i > 0 ? "border-t border-[var(--line-soft)]" : ""
              }`}
            >
              <p
                className="font-mono text-[13px]"
                style={{ color: `var(--${row.accent})` }}
              >
                {row.period}
              </p>
              <div>
                <h2 className="t-h3 text-[var(--bone)]">{row.title}</h2>
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

          <FadeIn delay={0.2} className="mt-10">
            <Button variant="ghost" href="/contact">
              LET&apos;S WORK TOGETHER
            </Button>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
