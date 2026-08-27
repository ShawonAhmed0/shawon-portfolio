import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import EditingFilter from "@/components/EditingFilter";
import FadeIn from "@/components/FadeIn";
import HeroCanvas from "@/components/HeroCanvas";
import SiteNav from "@/components/SiteNav";
import Timecode from "@/components/Timecode";
import { pageMetadata } from "@/lib/seo";
import { embedUrl } from "@/lib/embed";
import { real, realHref } from "@/lib/placeholder";
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
  const testimonials = editing.testimonials.filter((t) => real(t.quote));
  const credential = real(editing.credential.label) && realHref(editing.credential.href)
    ? editing.credential
    : null;

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

          {/* Third-party proof, which is the one thing a portfolio cannot
              assert about itself. Rendered only when it has been filled in. */}
          {credential ? (
            <FadeIn delay={0.75} onMount className="mt-10">
              <a
                href={credential.href}
                target="_blank"
                rel="noreferrer"
                className="rule-grow inline-flex items-center gap-2 text-[var(--bone)]"
              >
                <span className="t-label" style={{ color: "var(--watch)" }}>
                  {credential.label}
                </span>
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
              </a>
              {credential.stats.length > 0 ? (
                <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-5">
                  {credential.stats.map((stat) => (
                    <div key={stat.label}>
                      <dt className="sr-only">{stat.label}</dt>
                      <dd
                        className="t-h3 m-0 text-[var(--bone)]"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {stat.value}
                      </dd>
                      <p className="t-label mt-1">{stat.label}</p>
                    </div>
                  ))}
                </dl>
              ) : null}
            </FadeIn>
          ) : null}
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

      {/* CLIENT FEEDBACK */}
      {testimonials.length > 0 ? (
        <section
          data-timecode={MARK.testimonials.code}
          data-timecode-label="CLIENT FEEDBACK"
          className={`py-20 md:py-28 ${PAD}`}
        >
          <div className="shell">
            <FadeIn>
              <Timecode
                code={MARK.testimonials.code}
                label={MARK.testimonials.label}
                accent="watch"
              />
            </FadeIn>

            <div className="grid gap-5 md:grid-cols-2">
              {testimonials.map((item, i) => (
                <FadeIn key={item.quote} delay={i * 0.05}>
                  {/* blockquote/cite rather than styled divs: this is a real
                      quotation from someone else, and the markup should say so. */}
                  <figure className="panel ground-watch m-0 flex h-full flex-col p-7 md:p-8">
                    <blockquote className="t-lead m-0 text-[var(--bone)]">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-auto pt-7">
                      <p className="t-label" style={{ color: "var(--watch)" }}>
                        {item.author || "Upwork client"}
                      </p>
                      {item.context ? (
                        <p className="t-body mt-2 text-[var(--muted)]">{item.context}</p>
                      ) : null}
                      {item.date || item.source ? (
                        <p className="t-label mt-3">
                          {[item.source, item.date].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                    </figcaption>
                  </figure>
                </FadeIn>
              ))}
            </div>

            {credential ? (
              <FadeIn delay={0.2} className="mt-8">
                <a
                  href={credential.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rule-grow inline-flex items-center gap-2 text-[var(--bone)]"
                >
                  <span className="t-label">Read all reviews on Upwork</span>
                  <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden />
                </a>
              </FadeIn>
            ) : null}
          </div>
        </section>
      ) : null}

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
    </main>
  );
}
