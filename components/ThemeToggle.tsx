"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { watchTheme } from "@/lib/cssColor";
import { applyTheme, currentTheme } from "@/lib/theme";

/**
 * Two states, not three. The site is dark by default and does not consult
 * prefers-color-scheme, so there is no "follow the system" case to carry —
 * either a light choice is stored or the page is dark.
 *
 * The stored choice is applied by a blocking script in the layout, before
 * paint. Reading it here instead would flash dark on every load for anyone
 * who picked light. This component only reflects and updates that state, so
 * it renders the dark-default icon on the server and corrects itself on mount
 * for the stored-light case — one frame, and only for that case.
 *
 * State is read from <html>, never held privately. Two of these are mounted
 * at once (the desktop bar and the phone bar, each hidden at the other's
 * breakpoint); with local state, toggling one would leave the other holding a
 * stale value, and its next click would decide the wrong direction.
 */
export default function ThemeToggle() {
  const [light, setLight] = useState(false);

  useEffect(() => {
    const sync = () => setLight(currentTheme() === "light");
    sync();
    return watchTheme(sync);
  }, []);

  const toggle = () => applyTheme(currentTheme() === "light" ? "dark" : "light");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${light ? "dark" : "light"} theme`}
      aria-pressed={!light}
      className="theme-toggle"
    >
      <span aria-hidden className="theme-toggle-icon">
        {light ? (
          <Moon size={16} strokeWidth={1.75} />
        ) : (
          <Sun size={16} strokeWidth={1.75} />
        )}
      </span>
    </button>
  );
}
