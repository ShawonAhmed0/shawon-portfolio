"use client";

import { useState } from "react";
import { ChevronDown, ArrowUp, ArrowDown, Trash2, Plus, X } from "lucide-react";

/**
 * Form primitives for the editor.
 *
 * Every one is controlled and pushes a whole new value upward. The panel keeps
 * one bundle object in state and rebuilds it on each keystroke, which is what
 * lets the save bar diff against the loaded copy and know exactly what a
 * publish would change.
 */

/** The original content ships TODO markers. Flagging them turns the panel into
 *  a checklist of what is still missing rather than a wall of equal fields. */
const isTodo = (value: string) => value.trimStart().startsWith("TODO:");

export function Text({
  label,
  value,
  onChange,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="ad-field">
      <span className="ad-label">{label}</span>
      <input
        className="ad-input"
        data-todo={isTodo(value)}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="ad-hint">{hint}</span> : null}
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  hint,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="ad-field">
      <span className="ad-label">{label}</span>
      <textarea
        className="ad-area"
        data-todo={isTodo(value)}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className="ad-hint">{hint}</span> : null}
    </label>
  );
}

export function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="ad-check">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function Select<T extends string>({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
  hint?: string;
}) {
  return (
    <label className="ad-field">
      <span className="ad-label">{label}</span>
      <select className="ad-select" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="ad-hint">{hint}</span> : null}
    </label>
  );
}

/** A list of plain strings — skill items, tags, bullet points. */
export function StringList({
  label,
  value,
  onChange,
  hint,
  addLabel = "Add",
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  hint?: string;
  addLabel?: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const set = (index: number, next: string) =>
    onChange(value.map((item, i) => (i === index ? next : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="ad-field">
      <span className="ad-label">{label}</span>
      {hint ? <span className="ad-hint">{hint}</span> : null}
      <div className="ad-list">
        {value.map((item, index) => (
          <div className="ad-list-row" key={index}>
            {multiline ? (
              <textarea
                className="ad-area"
                data-todo={isTodo(item)}
                rows={3}
                value={item}
                placeholder={placeholder}
                onChange={(e) => set(index, e.target.value)}
              />
            ) : (
              <input
                className="ad-input"
                data-todo={isTodo(item)}
                value={item}
                placeholder={placeholder}
                onChange={(e) => set(index, e.target.value)}
              />
            )}
            <button
              type="button"
              className="ad-icon-btn"
              onClick={() => move(index, -1)}
              disabled={index === 0}
              aria-label={`Move ${label} item ${index + 1} up`}
            >
              <ArrowUp size={14} />
            </button>
            <button
              type="button"
              className="ad-icon-btn"
              onClick={() => move(index, 1)}
              disabled={index === value.length - 1}
              aria-label={`Move ${label} item ${index + 1} down`}
            >
              <ArrowDown size={14} />
            </button>
            <button
              type="button"
              className="ad-icon-btn"
              onClick={() => onChange(value.filter((_, i) => i !== index))}
              aria-label={`Remove ${label} item ${index + 1}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="ad-btn ad-btn-ghost self-start" onClick={() => onChange([...value, ""])}>
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

/**
 * A list of objects, one accordion row each.
 *
 * Open state is a single index rather than a set: on a phone two expanded
 * project forms is already more than a screen, and collapsing the previous one
 * keeps the row you are editing in view. Opening is reset on delete, since the
 * index that was open now points at a different item.
 */
export function Repeater<T>({
  items,
  onChange,
  blank,
  title,
  addLabel,
  render,
  confirmDelete = true,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  blank: () => T;
  title: (item: T, index: number) => string;
  addLabel: string;
  render: (item: T, update: (patch: Partial<T>) => void, index: number) => React.ReactNode;
  confirmDelete?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const update = (index: number) => (patch: Partial<T>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    setOpen(open === index ? target : open === target ? index : open);
  };

  const remove = (index: number) => {
    if (confirmDelete && !window.confirm(`Remove "${title(items[index], index)}"?`)) return;
    onChange(items.filter((_, i) => i !== index));
    setOpen(null);
  };

  return (
    <div>
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div className="ad-item" data-open={isOpen} key={index}>
            <div className="ad-item-bar">
              <button
                type="button"
                className="ad-icon-btn"
                onClick={() => setOpen(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-label={isOpen ? "Collapse" : "Expand"}
              >
                <ChevronDown
                  size={14}
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "none",
                    transition: "transform 180ms ease",
                  }}
                />
              </button>
              <button type="button" className="ad-item-title" onClick={() => setOpen(isOpen ? null : index)}>
                {title(item, index) || "Untitled"}
              </button>
              <button
                type="button"
                className="ad-icon-btn"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                <ArrowUp size={14} />
              </button>
              <button
                type="button"
                className="ad-icon-btn"
                onClick={() => move(index, 1)}
                disabled={index === items.length - 1}
                aria-label="Move down"
              >
                <ArrowDown size={14} />
              </button>
              <button
                type="button"
                className="ad-icon-btn"
                onClick={() => remove(index)}
                aria-label="Remove"
              >
                <Trash2 size={14} />
              </button>
            </div>
            {isOpen ? <div className="ad-item-body">{render(item, update(index), index)}</div> : null}
          </div>
        );
      })}
      <button
        type="button"
        className="ad-btn ad-btn-ghost mt-3"
        onClick={() => {
          onChange([...items, blank()]);
          setOpen(items.length);
        }}
      >
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="ad-card">
      <h3 className="ad-card-h">{title}</h3>
      <div className="ad-stack">{children}</div>
    </section>
  );
}
