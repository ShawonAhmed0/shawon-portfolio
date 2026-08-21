"use client";

import { useEffect, useState } from "react";
import { LUTS, NEUTRAL, applyGrade, readStored } from "@/lib/grade";

/**
 * Konami code exports the page.
 *
 * The reward reuses the machinery already on the site rather than inventing a
 * separate toy: the grade rapid-cycles every LUT the way a render preview
 * flickers through frames, a progress bar sweeps the timeline, and it reports
 * back in the same monospace voice the rest of the chrome uses. Whatever grade
 * the visitor had set is restored at the end, so finding this costs them
 * nothing.
 */

const SEQUENCE = [
  "arrowup", "arrowup", "arrowdown", "arrowdown",
  "arrowleft", "arrowright", "arrowleft", "arrowright",
  "b", "a",
];

const STEP_MS = 190;

export default function RenderEgg() {
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let hit = 0;
    let running = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const run = () => {
      if (running) return;
      running = true;
      const restore = readStored();
      const looks = LUTS.filter((l) => l.id !== "neutral");

      looks.forEach((lut, i) => {
        timers.push(
          setTimeout(() => {
            applyGrade({ ...NEUTRAL, lut: lut.id });
            setProgress((i + 1) / looks.length);
          }, i * STEP_MS),
        );
      });

      timers.push(
        setTimeout(
          () => {
            applyGrade(restore);
            setProgress(null);
            setDone(true);
            timers.push(
              setTimeout(() => {
                setDone(false);
                running = false;
              }, 2600),
            );
          },
          looks.length * STEP_MS + 260,
        ),
      );
    };

    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      hit = key === SEQUENCE[hit] ? hit + 1 : key === SEQUENCE[0] ? 1 : 0;
      if (hit === SEQUENCE.length) {
        hit = 0;
        run();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  if (progress === null && !done) return null;

  return (
    <div className="render-egg" role="status" aria-live="polite">
      {done ? (
        <p className="render-egg-done">
          RENDER COMPLETE<span>·</span>00:04:00:00<span>·</span>ProRes 4444
        </p>
      ) : (
        <>
          <p className="render-egg-label">
            EXPORTING<span>{Math.round((progress ?? 0) * 100)}%</span>
          </p>
          <span aria-hidden className="render-egg-track">
            <span
              className="render-egg-fill"
              style={{ transform: `scaleX(${progress ?? 0})` }}
            />
          </span>
        </>
      )}
    </div>
  );
}
