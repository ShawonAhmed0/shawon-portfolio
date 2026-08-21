"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import Wordmark from "@/components/Wordmark";
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
          aria-label={`${site.mark} — home`}
          className="shrink-0 transition-opacity duration-200 hover:opacity-70"
        >
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navLinks.slice(0, -1).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className="nav-link text-[14px] font-medium tracking-[-0.005em] transition-colors duration-200"
              data-active={isActive(link.href)}
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
          <Link
            href="/contact"
            className="rounded-[var(--pill)] px-5 py-2.5 text-[13px] font-medium transition-opacity duration-200 hover:opacity-85"
            style={{ background: "var(--bone)", color: "var(--ink)" }}
          >
            Get in touch
          </Link>
        </div>

        {/* Phone bar. The toggle sits out here rather than only inside the
            menu — a theme switch buried behind a hamburger is a theme switch
            nobody finds. The copy inside the menu stays for when the overlay
            is covering this one. */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-[45] -mr-2 flex flex-col gap-[5px] p-2"
          >
            <span aria-hidden className="block h-px w-5 bg-[var(--bone)]" />
            <span aria-hidden className="block h-px w-5 bg-[var(--bone)]" />
          </button>
        </div>

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
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex items-center gap-4">
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="t-label"
                  >
                    CLOSE
                  </button>
                </div>
              </div>,
              document.body,
            )
          : null}
      </nav>
    </header>
  );
}
