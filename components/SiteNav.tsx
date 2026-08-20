"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks, site } from "@/content/site";

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lifted, setLifted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);

  // Backdrop only once the page has actually moved — a bar that is already
  // frosted at rest reads as chrome sitting on top of the design.
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href !== "/" && pathname.startsWith(href.replace(/#.*$/, ""));

  return (
    <header
      className="sticky top-0 z-40 transition-colors duration-300"
      style={{
        background: lifted
          ? "color-mix(in srgb, var(--ink) 80%, transparent)"
          : "transparent",
        backdropFilter: lifted ? "blur(14px)" : "none",
        borderBottom: `1px solid ${lifted ? "var(--line)" : "transparent"}`,
      }}
    >
      <nav className="shell flex items-center justify-between gap-8 px-5 py-4 sm:px-8 md:px-12 lg:px-16">
        <Link
          href="/"
          className="t-h3 shrink-0 leading-none text-[var(--bone)] transition-opacity duration-200 hover:opacity-70"
          style={{ fontSize: "1.125rem", letterSpacing: "-0.02em", fontWeight: 700 }}
        >
          {site.mark}
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.slice(0, -1).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium tracking-[0.01em] transition-colors duration-200"
              style={{ color: isActive(link.href) ? "var(--bone)" : "var(--muted)" }}
            >
              {link.label.charAt(0) + link.label.slice(1).toLowerCase()}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-[var(--pill)] px-5 py-2.5 text-[13px] font-medium transition-opacity duration-200 hover:opacity-85"
            style={{ background: "var(--bone)", color: "var(--ink)" }}
          >
            Get in touch
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="relative z-[45] -mr-2 flex flex-col gap-[5px] p-2 md:hidden"
        >
          <span aria-hidden className="block h-px w-5 bg-[var(--bone)]" />
          <span aria-hidden className="block h-px w-5 bg-[var(--bone)]" />
        </button>

        {mounted && open
          ? createPortal(
              <div
                id="site-menu"
                className="fixed inset-0 z-40 flex flex-col justify-center gap-7 px-8 md:hidden"
                style={{ background: "var(--ink)" }}
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="t-h3 text-[var(--bone)]"
                  >
                    {link.label.charAt(0) + link.label.slice(1).toLowerCase()}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="t-label mt-4 self-start"
                >
                  CLOSE
                </button>
              </div>,
              document.body,
            )
          : null}
      </nav>
    </header>
  );
}
