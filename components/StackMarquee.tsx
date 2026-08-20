import { engineering, editing } from "@/content/site";

/**
 * Continuous ticker of the real stack. Both references anchor the hero with a
 * strip like this — logos in theirs, tools here, because these are things
 * Shawon actually works in rather than clients to imply.
 *
 * Duplicated once so the loop is seamless; the copy is aria-hidden so the
 * list is announced a single time.
 */
export default function StackMarquee() {
  const items = [
    ...engineering.skills.flatMap((g) => g.items),
    ...editing.emphasis.slice(0, 6),
  ];

  const Row = ({ hidden = false }: { hidden?: boolean }) => (
    <ul
      className="flex shrink-0 items-center gap-8 pr-8"
      {...(hidden ? { "aria-hidden": true } : {})}
    >
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex shrink-0 items-center gap-8">
          <span
            className="whitespace-nowrap text-[14px] font-medium"
            style={{ color: "var(--muted)" }}
          >
            {item}
          </span>
          <span
            aria-hidden
            className="h-1 w-1 shrink-0 rounded-[var(--pill)]"
            style={{ background: "var(--line)" }}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="marquee-mask relative overflow-hidden py-6">
      <div className="marquee-track flex w-max">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
