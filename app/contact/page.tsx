import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import SiteNav from "@/components/SiteNav";
import Timecode from "@/components/Timecode";
import { contact } from "@/content/site";

const PAD = "px-5 sm:px-8 md:px-12 lg:px-16";

export const metadata: Metadata = pageMetadata({
  path: "/contact",
  title: "Contact",
  description:
    "Get in touch with Shawon Ahmed — web developer and video editor. Available for new projects.",
});

export default function ContactPage() {
  return (
    <main>
      <SiteNav />

      <section
        data-timecode={contact.timecode}
        data-timecode-label="END OF REEL"
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

            <ul className="mt-10 flex flex-wrap gap-3">
              {contact.socials.map((social) => (
                <li key={social.label}>
                  <Link
                    href={social.href}
                    {...(social.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="inline-flex items-center gap-2 rounded-[var(--pill)] border border-[var(--line)] px-4 py-2 text-[13px] font-medium transition-colors duration-200 hover:border-[var(--bone)]"
                    style={{ background: "var(--surface)", color: "var(--bone)" }}
                  >
                    {social.label}
                    {social.external ? (
                      <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden />
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
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
