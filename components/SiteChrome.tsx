"use client";

import { usePathname } from "next/navigation";
import IntroCurtain from "@/components/IntroCurtain";
import GradeFilters from "@/components/GradeFilters";
import GradePanel from "@/components/GradePanel";
import Timeline from "@/components/Timeline";
import Tilt from "@/components/Tilt";
import RenderEgg from "@/components/RenderEgg";
import PlayheadCursor from "@/components/PlayheadCursor";

/**
 * Decides whether a route wears the site's chrome.
 *
 * The admin routes are a tool, not part of the reel: the intro curtain, the
 * playhead cursor, the transport bar and the grain would all fight a form.
 * The colour grade matters most — it is a real CSS `filter` on `.grade-stage`,
 * so a stored grade would tint the editing UI and make the user colour-correct
 * their own controls.
 *
 * A client component rather than a route group with its own root layout: the
 * alternative means relocating every page in the app into `(site)/` to change
 * what two routes render. This returns before mounting any of it, so the
 * chrome's effects and canvases never start on these routes.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/login" || pathname.startsWith("/admin");

  if (bare) return <>{children}</>;

  return (
    <>
      <IntroCurtain />
      <GradeFilters />

      {/*
        The grade stage. Only the page content sits inside it, for two
        reasons: a `filter` makes an element the containing block for fixed
        descendants, which would peel the timeline and cursor off the
        viewport; and the chrome should stay neutral anyway, the way the UI
        of a grading suite is never itself graded.
      */}
      <div className="grade-stage">{children}</div>

      {/*
        soft-light, not overlay: against a near-black ground, overlay
        multiplies the noise down to nothing. soft-light lifts it into
        visible texture.
      */}
      <div
        aria-hidden
        className="grain pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-multiply"
      />
      <Timeline />
      <Tilt />
      <RenderEgg />
      <PlayheadCursor />
      <GradePanel />
    </>
  );
}
