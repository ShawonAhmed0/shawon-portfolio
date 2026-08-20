"use client";

import { useEffect, useState } from "react";

type CursorState = {
  x: number;
  y: number;
  code: string;
  visible: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Signature interaction. Only active over [data-playhead] media, and only on
 * fine pointers — touch devices never mount it.
 */
export default function PlayheadCursor() {
  const [fine, setFine] = useState(false);
  const [state, setState] = useState<CursorState>({
    x: 0,
    y: 0,
    code: "00:00:00:00",
    visible: false,
  });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const onChange = () => setFine(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!fine) return;

    const hide = () =>
      setState((prev) => (prev.visible ? { ...prev, visible: false } : prev));

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return hide();

      const target = event.target as Element | null;
      const media = target?.closest?.("[data-playhead]") as HTMLElement | null;
      if (!media) return hide();

      const rect = media.getBoundingClientRect();
      const ratio =
        rect.width > 0
          ? Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
          : 0;
      const frames = Math.round(ratio * (60 * 24 - 1));
      const seconds = Math.min(59, Math.floor(frames / 24));

      setState({
        x: event.clientX,
        y: event.clientY,
        code: `00:00:${pad(seconds)}:${pad(frames % 24)}`,
        visible: true,
      });
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", hide);
    window.addEventListener("blur", hide);
    window.addEventListener("scroll", hide, { passive: true });

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", hide);
      window.removeEventListener("blur", hide);
      window.removeEventListener("scroll", hide);
    };
  }, [fine]);

  if (!fine) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70]"
      style={{
        transform: `translate3d(${state.x}px, ${state.y}px, 0)`,
        opacity: state.visible ? 1 : 0,
        transition: `opacity ${state.visible ? 150 : 200}ms linear`,
      }}
    >
      <span
        className="absolute block w-px"
        style={{ height: 56, top: -28, background: "var(--watch)" }}
      />
      <span
        className="absolute whitespace-nowrap"
        style={{
          top: 32,
          left: 6,
          fontFamily: "var(--font-mono), ui-monospace, monospace",
          fontSize: 10,
          lineHeight: 1,
          color: "var(--watch)",
        }}
      >
        {state.code}
      </span>
    </div>
  );
}
