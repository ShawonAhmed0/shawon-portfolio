"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  type Grade,
  type LutId,
  LUTS,
  NEUTRAL,
  applyGrade,
  isNeutral,
  readStored,
} from "@/lib/grade";

/**
 * The grading panel. Opens with G, closes with G or Escape.
 *
 * Every control writes straight through to the live filter — there is no
 * apply step, because a grading panel that needs one is a settings dialog.
 */

const SLIDERS: {
  key: keyof Omit<Grade, "lut">;
  label: string;
  unit: string;
  /** Stops read as signed; the unitless ones read as a multiplier. */
  format: (v: number) => string;
}[] = [
  {
    key: "exposure",
    label: "EXPOSURE",
    unit: "stops",
    format: (v) => `${v > 0 ? "+" : ""}${v.toFixed(2)}`,
  },
  {
    key: "contrast",
    label: "CONTRAST",
    unit: "",
    format: (v) => (1 + v * 0.6).toFixed(2),
  },
  {
    key: "saturation",
    label: "SATURATION",
    unit: "",
    format: (v) => (1 + v).toFixed(2),
  },
];

export default function GradePanel() {
  const [open, setOpen] = useState(false);
  const [grade, setGrade] = useState<Grade>(NEUTRAL);
  // Mirrors `grade` so an update always builds on the newest value. Reading
  // state through the closure loses changes that land in the same tick: pick
  // a LUT and immediately drag a slider, and the slider writes a grade built
  // from the pre-LUT value, silently discarding the choice.
  const gradeRef = useRef<Grade>(NEUTRAL);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // The stored grade is applied on mount rather than pre-paint: unlike the
  // theme it is a rare, opt-in state, so the cost of a blocking script on
  // every load for every visitor is not worth the flash it would save.
  useEffect(() => {
    const stored = readStored();
    gradeRef.current = stored;
    setGrade(stored);
    if (!isNeutral(stored)) applyGrade(stored);
  }, []);

  const update = useCallback((patch: Partial<Grade>) => {
    const next = { ...gradeRef.current, ...patch };
    gradeRef.current = next;
    setGrade(next);
    applyGrade(next);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      // Ignore the shortcut while the visitor is typing or holding a modifier.
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "g" || e.key === "G") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Move focus in when it opens so the panel is keyboard-operable at once.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const dirty = !isNeutral(grade);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="grade-panel"
        className="grade-trigger"
        data-dirty={dirty || undefined}
      >
        <SlidersHorizontal size={15} strokeWidth={1.75} aria-hidden />
        <span className="grade-trigger-label">
          {/* A moved slider with no LUT picked is still a graded page, so the
              label cannot fall back to the LUT's name — it would read
              "NEUTRAL" while the picture is anything but. */}
          {!dirty
            ? "GRADE"
            : grade.lut !== "neutral"
              ? LUTS.find((l) => l.id === grade.lut)!.name
              : "GRADED"}
        </span>
        <kbd aria-hidden className="grade-key">
          G
        </kbd>
      </button>

      <div
        id="grade-panel"
        ref={panelRef}
        tabIndex={-1}
        role="group"
        aria-label="Colour grade"
        className="grade-panel"
        data-open={open || undefined}
        aria-hidden={!open}
        // React 19 takes inert as a real boolean; an empty string reads as
        // false and leaves the closed panel in the tab order.
        inert={!open}
      >
        <header className="grade-head">
          <div>
            <p className="grade-title">COLOUR</p>
            <p className="grade-sub">
              {LUTS.find((l) => l.id === grade.lut)?.note}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
            aria-label="Close grade panel"
            className="grade-close"
          >
            <X size={14} strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        <div className="grade-luts" role="radiogroup" aria-label="Look">
          {LUTS.map((lut) => (
            <button
              key={lut.id}
              type="button"
              role="radio"
              aria-checked={grade.lut === lut.id}
              onClick={() => update({ lut: lut.id as LutId })}
              className="grade-lut"
              data-active={grade.lut === lut.id || undefined}
            >
              {/* The swatch is graded by the same filter it selects, so it
                  previews the actual look rather than approximating it. */}
              <span
                aria-hidden
                className="grade-swatch"
                style={
                  lut.id === "neutral"
                    ? undefined
                    : { filter: `url(#lut-${lut.id})` }
                }
              />
              <span className="grade-lut-name">{lut.name}</span>
            </button>
          ))}
        </div>

        <div className="grade-sliders">
          {SLIDERS.map((s) => (
            <label key={s.key} className="grade-slider">
              <span className="grade-slider-head">
                <span>{s.label}</span>
                <output>
                  {s.format(grade[s.key])}
                  {s.unit ? <em> {s.unit}</em> : null}
                </output>
              </span>
              <input
                type="range"
                min={-1}
                max={1}
                step={0.01}
                value={grade[s.key]}
                onChange={(e) => update({ [s.key]: Number(e.target.value) })}
                // Double-click a slider to zero that channel — the standard
                // gesture everywhere else a control has a detent.
                onDoubleClick={() => update({ [s.key]: 0 })}
              />
            </label>
          ))}
        </div>

        <footer className="grade-foot">
          <span className="grade-note">Applies to every page</span>
          <button
            type="button"
            onClick={() => update(NEUTRAL)}
            disabled={!dirty}
            className="grade-reset"
          >
            RESET
          </button>
        </footer>
      </div>
    </>
  );
}
