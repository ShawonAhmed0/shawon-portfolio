import type { CSSProperties } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import FadeIn from "@/components/FadeIn";
import HeroCanvas from "@/components/HeroCanvas";
import HeroPortrait from "@/components/HeroPortrait";
import BezierGraph from "@/components/BezierGraph";
import ContactSheet from "@/components/ContactSheet";
import FloatingChips from "@/components/FloatingChips";
import HeroFX from "@/components/HeroFX";
import Magnetic from "@/components/Magnetic";
import Parallax from "@/components/Parallax";
import RoleCycler from "@/components/RoleCycler";
import WaveformRibbon from "@/components/WaveformRibbon";
import StackMarquee from "@/components/StackMarquee";
import MarqueeRow from "@/components/MarqueeRow";
import SiteNav from "@/components/SiteNav";
import Timecode from "@/components/Timecode";
import WorkCard from "@/components/WorkCard";
import {
  bridge,
  contact,
  fork,
  reelFrames,
  site,
} from "@/content/site";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";

const PAD = "px-5 sm:px-8 md:px-12 lg:px-16";

export default function Home() {
  return (
    <main>
      <SiteNav />

      {/* ── 01 · HERO ─────────────────────────────────────────────
          Reference language: soft gradient bloom, cutout portrait as the
          centrepiece, bold sans carrying the name with one serif-italic
          phrase against it, pill badge, black pill CTA. */}
      <section
        id="hero"
        data-timecode="00:00:00:00"
        className={`relative overflow-hidden pb-20 pt-8 md:pb-28 md:pt-12 ${PAD}`}
      >
        <Parallax distance={40} className="absolute inset-0 z-0">
          <HeroCanvas />
        </Parallax>

        <HeroFX targetId="hero" />
        <ContactSheet />
        <WaveformRibbon />
        <FloatingChips />

        <div className="shell relative z-10">
          <BezierGraph className="bezier-graph pointer-events-none absolute bottom-0 right-0 z-[3] hidden lg:block" />

          {/* On mobile the portrait leads: source order puts the copy first, so
              both columns are explicitly ordered and the override is dropped
              from md up, where the two-column grid takes over. */}
          <div className="grid items-end gap-10 md:mt-8 md:grid-cols-[minmax(0,1fr)_auto] md:gap-14">
            <div className="order-2 md:order-1">
              <FadeIn delay={0.15} onMount className="mb-7">
                <span className="pill">
                  <span aria-hidden className="pill-dot" />
                  <RoleCycler
                    phrases={[
                      "Software Engineer",
                      "Performance Creative",
                      "Video Editor",
                    ]}
                  />
                </span>
              </FadeIn>

              <h1 className="t-hero text-[var(--bone)]">
                {["Hi,", "I\u2019m", site.name.split(" ")[0]].map((word, i) => (
                  <span
                    key={word}
                    className="word"
                    style={{ "--i": i } as CSSProperties}
                  >
                    {word}
                    {"\u00A0"}
                  </span>
                ))}
                <br />
                <span
                  className="word t-accent"
                  style={{ "--i": 3 } as CSSProperties}
                >
                  {site.name.split(" ").slice(1).join(" ")}
                </span>
              </h1>

              <FadeIn delay={0.45} onMount as="p" className="t-body mt-7 max-w-[46ch]">
                {site.intro}
              </FadeIn>

              <FadeIn
                delay={0.55}
                onMount
                className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <Magnetic>
                  <Button variant="build" href="/software">
                    BUILD → SOFTWARE
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button variant="watch" href="/editing">
                    WATCH → VIDEO EDITING
                  </Button>
                </Magnetic>
              </FadeIn>
            </div>

            <Parallax distance={-60} className="order-1 justify-self-center md:order-2 md:justify-self-end">
              <FadeIn delay={0.35} y={16} onMount>
                <HeroPortrait />
              </FadeIn>
            </Parallax>
          </div>

        </div>
      </section>

      <div className={`relative z-10 ${PAD}`}>
        <div className="shell">
          <StackMarquee />
        </div>
      </div>

      {/* ── 02 · THE FORK — 00:00:12:04 ─────────────────────────── */}
      <section
        data-timecode={fork.build.timecode}
        className={`py-16 md:py-24 ${PAD}`}
      >
        <div className="shell grid gap-5 md:grid-cols-2">
          <div className="ground-build panel group relative flex min-h-[380px] flex-col overflow-hidden p-8 md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] md:group-hover:opacity-[0.09]"
              style={{ backgroundImage: "var(--build-glow)" }}
            />
            <FadeIn className="relative">
              <Timecode
                code={fork.build.timecode}
                label={fork.build.label}
                accent="build"
              />
              <h2 className="t-h2 text-[var(--bone)] transition-transform duration-[400ms] md:group-hover:translate-x-[6px]">
                {fork.build.heading}
              </h2>
            </FadeIn>

            <FadeIn delay={0.1} className="relative mt-8">
              <p className="t-body max-w-[38ch]">{fork.build.body}</p>
              <p
                className="mt-6 font-mono text-[12px] tracking-[0.14em]"
                style={{ color: "var(--build)" }}
              >
                {fork.build.stack}
              </p>
              <Button
                variant="build"
                href={fork.build.href}
                className="mt-8"
              >
                {fork.build.cta}
              </Button>
            </FadeIn>
          </div>

          <div className="ground-watch panel group relative flex min-h-[380px] flex-col overflow-hidden p-8 md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[400ms] md:group-hover:opacity-[0.09]"
              style={{ backgroundImage: "var(--watch-glow)" }}
            />
            <FadeIn className="relative">
              <Timecode
                code={fork.watch.timecode}
                label={fork.watch.label}
                accent="watch"
              />
              <h2 className="t-h2 text-[var(--bone)] transition-transform duration-[400ms] md:group-hover:translate-x-[6px]">
                {fork.watch.heading}
              </h2>
            </FadeIn>

            <FadeIn delay={0.1} className="relative mt-8">
              <p className="t-body max-w-[38ch]">{fork.watch.body}</p>
              <p
                className="mt-6 font-mono text-[12px] tracking-[0.14em]"
                style={{ color: "var(--watch)" }}
              >
                {fork.watch.stack}
              </p>
              <Button
                variant="watch"
                href={fork.watch.href}
                className="mt-8"
              >
                {fork.watch.cta}
              </Button>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 03 · SELECTED WORK — 00:01:08:16 ────────────────────── */}
      <section
        id="work"
        data-timecode="00:01:08:16"
        className={`py-24 md:py-36 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode code="00:01:08:16" label="SELECTED WORK" />
            <div className="ghost-head mb-14">
              <span aria-hidden className="ghost">
                Work
              </span>
              <h2 className="t-h2 text-[var(--bone)]">
                Selected <span className="t-accent">work</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid gap-5 md:grid-cols-2">
            {projects.map((project, index) => (
              <WorkCard
                key={project.slug}
                project={project}
                featured={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 · REEL STRIP — 00:01:52:07 ───────────────────────── */}
      <section
        data-timecode="00:01:52:07"
        className="ground-alt overflow-hidden py-24 md:py-28"
      >
        <div className={PAD}>
          <div className="shell">
            <FadeIn>
              <Timecode code="00:01:52:07" label="FRAMES" />
            </FadeIn>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <MarqueeRow
            items={reelFrames.slice(0, 6)}
            direction="right"
            speedFactor={0.28}
          />
          <MarqueeRow
            items={reelFrames.slice(6, 12)}
            direction="left"
            speedFactor={0.28}
          />
        </div>
      </section>

      {/* ── 05 · WHERE CODE MEETS CREATIVE — 00:02:14:02 ────────── */}
      <section
        data-timecode={bridge.timecode}
        className={`py-24 md:py-36 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode code={bridge.timecode} label={bridge.label} />
            <div className="ghost-head mb-12">
              <span aria-hidden className="ghost">
                Craft
              </span>
              <h2 className="t-h2 max-w-[18ch] text-[var(--bone)]">
                {bridge.heading}
              </h2>
            </div>
          </FadeIn>

          <FadeIn
            delay={0.1}
            className="grid gap-5 md:grid-cols-2"
          >
            <div className="panel p-8 md:p-12">
              <p className="t-label" style={{ color: "var(--build)" }}>
                {bridge.build.label}
              </p>
              <ul className="mt-6">
                {bridge.build.items.map((item, i) => (
                  <li
                    key={item}
                    className={`py-4 text-[var(--bone)] ${
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
            </div>

            <div className="panel p-8 md:p-12">
              <p className="t-label" style={{ color: "var(--watch)" }}>
                {bridge.watch.label}
              </p>
              <ul className="mt-6">
                {bridge.watch.items.map((item, i) => (
                  <li
                    key={item}
                    className={`py-4 text-[var(--bone)] ${
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
            </div>
          </FadeIn>

          <FadeIn delay={0.15} className="mt-14">
            <p className="t-h2 mx-auto max-w-[20ch] text-center text-[var(--bone)]">
              I can <span className="t-accent" style={{ color: "var(--build)" }}>build</span>{" "}
              a product and think about how to{" "}
              <span className="t-accent" style={{ color: "var(--watch)" }}>sell it</span>.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ── 06 · EXPERIENCE — 00:03:06:19 ───────────────────────── */}
      <section
        data-timecode="00:03:06:19"
        className={`py-24 md:py-32 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode code="00:03:06:19" label="TIMELINE" />
          </FadeIn>

          <ol className="timeline">
            {experience.map((row) => (
              <li key={row.title} className="timeline-row">
                <span
                  aria-hidden
                  className="timeline-node"
                  style={{ background: `var(--${row.accent})` }}
                />
                <p
                  className="font-mono text-[12px] tracking-[0.08em]"
                  style={{ color: `var(--${row.accent})` }}
                >
                  {row.period}
                </p>
                <div className="pb-10">
                  <h3 className="t-h3 mt-1 text-[var(--bone)]">{row.title}</h3>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {row.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-[var(--pill)] px-3 py-1.5 text-[11px] font-medium"
                        style={{
                          background: "var(--surface-2)",
                          color: "var(--muted)",
                        }}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 07 · CONTACT — 00:04:00:00 ──────────────────────────── */}
      <section
        id="contact"
        data-timecode={contact.timecode}
        className={`py-24 md:py-32 ${PAD}`}
      >
        <div className="shell">
          <FadeIn>
            <Timecode code={contact.timecode} label={contact.label} />
            <div className="ghost-head">
              <span aria-hidden className="ghost">
                Contact
              </span>
              <h2 className="t-h2 max-w-[16ch] text-[var(--bone)]">
                Let&rsquo;s work <span className="t-accent">together</span>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="mt-12">
            <Magnetic strength={0.12}>
              <Link
                href={contact.email.href}
                className="mail-link inline-block text-[var(--bone)]"
              >
                {contact.email.label}
              </Link>
            </Magnetic>

            <ul className="mt-10 flex flex-wrap gap-7">
              {contact.socials.map((social) => (
                <li key={social.label}>
                  <Link
                    href={social.href}
                    className="t-label transition-colors duration-200 hover:text-[var(--bone)]"
                  >
                    {social.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="t-label mt-4">{contact.socialsNote}</p>
          </FadeIn>

          <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-8">
            <span className="text-[13px]" style={{ color: "var(--muted)" }}>
              {contact.footerLeft}
            </span>
            <span className="text-[13px]" style={{ color: "var(--faint)" }}>
              {contact.footerRight}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
