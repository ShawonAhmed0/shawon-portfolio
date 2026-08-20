import type { Metadata } from "next";
import Link from "next/link";
import FadeIn from "@/components/FadeIn";
import SiteNav from "@/components/SiteNav";
import Timecode from "@/components/Timecode";
import { contact, site } from "@/content/site";

const PAD = "px-5 sm:px-8 md:px-12 lg:px-16";

export const metadata: Metadata = {
  title: `Contact — ${site.title}`,
  description: site.intro,
};

export default function ContactPage() {
  return (
    <main>
      <SiteNav />

      <section
        data-timecode={contact.timecode}
        className={`py-24 md:py-32 ${PAD}`}
      >
        <div className="shell">
          <FadeIn onMount>
            <Timecode code={contact.timecode} label={contact.label} />
            <h1 className="t-h2 max-w-[14ch] text-[var(--bone)]">
              {contact.heading}
            </h1>
          </FadeIn>

          <FadeIn delay={0.1} onMount className="mt-12">
            <Link
              href={contact.email.href}
              className="mail-link inline-block text-[var(--bone)]"
            >
              {contact.email.label}
            </Link>

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
