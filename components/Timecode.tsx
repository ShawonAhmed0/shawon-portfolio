type TimecodeProps = {
  code: string;
  label: string;
  accent?: "build" | "watch" | "none";
  className?: string;
};

/**
 * Section marker. Restyled for the light system: the old full-width hairline
 * rule with a mono timecode dominated every section header. Now it reads as a
 * quiet eyebrow — the timecode survives as a small monospace tag rather than
 * a structural rule.
 */
export default function Timecode({
  code,
  label,
  accent = "none",
  className = "",
}: TimecodeProps) {
  const dot = accent === "none" ? "var(--faint)" : `var(--${accent})`;

  return (
    <div className={`mb-5 flex flex-wrap items-center gap-3 ${className}`}>
      <span
        className="inline-flex items-center gap-2 rounded-[var(--pill)] px-3 py-1"
        style={{ background: "var(--surface-2)" }}
      >
        <span
          aria-hidden
          className="block h-[5px] w-[5px] rounded-[var(--pill)]"
          style={{ background: dot }}
        />
        <span
          className="font-mono text-[10px] tracking-[0.14em]"
          style={{ color: "var(--faint)" }}
        >
          {code}
        </span>
      </span>
      <span
        className="text-[12px] font-medium uppercase tracking-[0.14em]"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </span>
    </div>
  );
}
