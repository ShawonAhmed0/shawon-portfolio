import Link from "next/link";
import type { ReactNode } from "react";

type ButtonProps = {
  variant?: "build" | "watch" | "ghost";
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

// Pill geometry, matching the reference language. Sans rather than mono:
// at pill scale the wide mono tracking read as a terminal chip.
const BASE =
  "inline-flex items-center gap-2 rounded-[var(--pill)] border px-6 py-3 text-[13px] font-medium tracking-[0.005em] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-[3px]";

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  build:
    "border-transparent bg-[var(--bone)] text-[var(--ink)] hover:opacity-85 shadow-[var(--shadow-card)]",
  watch:
    "border-[var(--line)] bg-[var(--surface)] text-[var(--bone)] hover:border-[var(--bone)] shadow-[var(--shadow-card)]",
  ghost:
    "border-[var(--line)] bg-[var(--surface)] text-[var(--bone)] hover:border-[var(--bone)]",
};

export default function Button({
  variant = "ghost",
  href,
  children,
  icon,
  className = "",
}: ButtonProps) {
  return (
    <Link href={href} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      <span>{children}</span>
      {icon ? (
        <span aria-hidden className="inline-flex shrink-0">
          {icon}
        </span>
      ) : null}
    </Link>
  );
}
