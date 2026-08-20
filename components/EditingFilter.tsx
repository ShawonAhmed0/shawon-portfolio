"use client";

import { useState } from "react";
import Link from "next/link";
import { editing } from "@/content/site";

export default function EditingFilter() {
  const [active, setActive] = useState(editing.categories[0]);

  const visible =
    active === editing.categories[0]
      ? editing.work
      : editing.work.filter((item) => item.category === active);

  return (
    <div>
      <div role="group" aria-label="Filter work by category" className="flex flex-wrap gap-2">
        {editing.categories.map((category) => {
          const selected = category === active;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(category)}
              className="rounded-[var(--pill)] border px-4 py-2 text-[13px] font-medium transition-colors duration-200"
              style={
                selected
                  ? {
                      background: "var(--bone)",
                      color: "var(--ink)",
                      borderColor: "var(--bone)",
                    }
                  : {
                      borderColor: "var(--line)",
                      color: "var(--muted)",
                      background: "var(--surface)",
                    }
              }
            >
              {category}
            </button>
          );
        })}
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => {
          const figure = (
            <figure>
              <div data-playhead className="frame aspect-video w-full">
                <img
                  src={item.image}
                  alt=""
                  width={760}
                  height={428}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="t-label mt-3 normal-case tracking-[0.06em]">
                {item.title}
              </figcaption>
              <p className="t-label mt-1" style={{ color: "var(--watch)" }}>
                {item.category}
              </p>
            </figure>
          );

          return (
            <li key={item.id}>
              {item.href ? (
                <Link href={item.href} className="block">
                  {figure}
                </Link>
              ) : (
                figure
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
