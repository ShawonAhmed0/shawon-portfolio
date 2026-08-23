import type { Metadata } from "next";
import EditingFilter from "@/components/EditingFilter";
import FadeIn from "@/components/FadeIn";
import HeroCanvas from "@/components/HeroCanvas";
import SiteNav from "@/components/SiteNav";
import Timecode from "@/components/Timecode";
import { pageMetadata } from "@/lib/seo";
import { embedUrl } from "@/lib/embed";
import { real } from "@/lib/placeholder";
import { editing, pageMarks } from "@/content/site";
import { experience } from "@/content/experience";
import { services } from "@/content/services";

const PAD = "px-5 sm:px-8 md:px-12 lg:px-16";
const MARK = pageMarks.editing;

export const metadata: Metadata = pageMetadata({
  path: "/editing",
  title: "Video Editor",
  description: `Shawon Ahmed, video editor. ${editing.body}`,
});

export default function EditingPage() {
  // Resolved once here rather than in the markup: null is the signal that
  // no usable link is set, and the placeholder is what should render then.
  const showreel = embedUrl(editing.showreelUrl);
  const showreelNote = real(editing.showreelNote);

  const editingExperience = experience.filter((row) => row.accent === "watch");

  return (
    <main>
      <SiteNav />

      {/* HERO — image backdrop, --watch accent. Same layout rule as home:
          no min-height, no mt-auto pin, so no dead band under the nav. */}
      <section
        data-timecode={MARK.hero.code}
        data-timecode-label="CREATIVE"
        className={`relative overflow-hidden pb-24 pt-10 md:pb-32 md:pt-14 ${PAD}`}
      >
        <HeroCanvas />

        <div className="shell relative z-10">
          <FadeIn delay={0.25} onMount>
            <Timecode
              code={MARK.hero.code}
              label={MARK.hero.label}
              accent="watch"
            />
          </FadeIn>

          <h1 className="t-hero rise-in max-w-[18ch] text-[var(--bone)]">
            {editing.heading}
          </h1>

          <FadeIn
            delay={0.45}
            onMount
            as="p"
            className="mt-6 font-mono text-[12px] tracking-[0.14em]"
            style={{ color: "var(--watch)" }}
          >
            {editing.subheading}
          </FadeIn>

          <FadeIn delay={0.55} onMount as="p" className="t-body mt-4 max-w-[52ch]">
            {editing.body}
          </FadeIn>

          <FadeIn delay={0.65} onMount className="mt-10">
            <p className="t-label">POSITIONING</p>
            <p className="t-lead mt-2">{editing.positioning}</p>
          </FadeIn>
        </div>
      </section>

      {/* SHOWREEL */}
      {showreel || showreelNote ? (
        <section
          data-timecode={MARK.showreel.code}
          data-timecode-label="SHOWREEL"
          className={`py-20 md:py-28 ${PAD}`}
        >
          <div className="shell">
            <FadeIn>
              <Timecode
                code={MARK.showreel.code}
                label={MARK.showreel.label}
                accent="watch"
              />
            </FadeIn>
            <FadeIn delay={0.1}>
              {showreel ? (
                <div
                  data-playhead
                  className="panel ground-watch aspect-video w-full overflow-hidden"
                >
                  <iframe
                    src={showreel}
                    title="Showreel"
                    className="h-full w-full border-0"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : showreelNote ? (
                <div
                  data-playhead
                  className="panel ground-watch flex aspect-video w-full items-center justify-center"
                >
                  <p className="t-label">{showreelNote}</p>
                </div>
              ) : null}
            </FadeIn>
          </div>
        </section>
      ) : null}

      {/* WORK */}
      <section
        data-timecode={MARK.work.code}
        data-timecode-label="SELECTED WORK"
        className={`py-20 md:py-28 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.work.code}
              label={MARK.work.label}
              accent="watch"
            />
            <div className="ghost-head mb-12">
              <span aria-hidden className="ghost">Reel</span>
              <h2 className="t-h2 text-[var(--bone)]">
                Selected <span className="t-accent">work</span>
              </h2>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <EditingFilter />
          </FadeIn>

          <FadeIn delay={0.15} className="mt-16">
            <p className="t-label">EMPHASIS</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {editing.emphasis.map((item) => (
                <li
                  key={item}
                  className="rounded-[var(--pill)] px-3 py-1.5 text-[11px] font-medium"
                  style={{ background: "var(--surface-2)", color: "var(--muted)" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* SERVICES */}
      <section
        data-timecode={MARK.services.code}
        data-timecode-label="SERVICES"
        className={`py-20 md:py-28 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode
              code={MARK.services.code}
              label={MARK.services.label}
              accent="watch"
            />
            <div className="ghost-head mb-12">
              <span aria-hidden className="ghost">Services</span>
              <h2 className="t-h2 text-[var(--bone)]">
                What I <span className="t-accent">do</span>
              </h2>
            </div>
          </FadeIn>

          <ul>
            {services.map((service, i) => (
              <FadeIn
                key={service.name}
                as="li"
                delay={i * 0.05}
                className={`grid gap-4 py-8 md:grid-cols-[260px_1fr] ${
                  i > 0 ? "border-t border-[var(--line-soft)]" : ""
                }`}
              >
                <h3 className="t-h3 text-[var(--bone)]">{service.name}</h3>
                <p className="t-body max-w-[62ch]">{service.description}</p>
              </FadeIn>
            ))}
          </ul>
        </div>
      </section>

      {/* EXPERIENCE */}
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
              accent="watch"
            />
          </FadeIn>

          {editingExperience.map((row) => (
            <FadeIn
              key={row.title}
              className="grid gap-6 py-10 md:grid-cols-[180px_1fr]"
            >
              <p
                className="font-mono text-[13px]"
                style={{ color: "var(--watch)" }}
              >
                {row.period}
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
    </main>
  );
}
