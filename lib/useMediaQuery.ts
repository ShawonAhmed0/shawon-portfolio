"use client";

import { useEffect, useState } from "react";

/**
 * Returns null until mounted, then the live match state. The null phase lets
 * callers avoid mounting media-only markup during SSR / first paint.
 */
export default function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
