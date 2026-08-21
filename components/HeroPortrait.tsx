import { portrait } from "@/content/site";

/**
 * Cutout portrait, one frame per theme.
 *
 * Both frames are rendered and CSS picks one, rather than JS swapping a src.
 * The theme is stamped on <html> before first paint, so a CSS choice is
 * correct on the very first frame; a JS swap would paint the light cut to a
 * dark-mode visitor and only correct it after hydration. The cost is that the
 * unused frame is also fetched — 83 KB, which is cheaper than the flash.
 *
 * The two cuts share a frame (900x1272), so sizing by height keeps the hero
 * box identical across a theme toggle: same width, same height, no reflow.
 * That shared frame is also what lets both sit in one grid cell and
 * cross-fade rather than cut — see .portrait-stack in globals.
 */
const FRAME = { width: 900, height: 1272 };
const SIZE = "h-[400px] sm:h-[460px] md:h-[540px] lg:h-[620px]";

function Frame({ theme, src }: { theme: "light" | "dark"; src: string }) {
  return (
    <span className={`portrait-frame portrait-frame--${theme}`}>
      <img
        src={src}
        alt={portrait.alt}
        width={FRAME.width}
        height={FRAME.height}
        decoding="async"
        className={`portrait-cutout block w-auto ${SIZE}`}
      />
    </span>
  );
}

export default function HeroPortrait() {
  return (
    <figure className="portrait-stack">
      <Frame theme="light" src={portrait.src} />
      <Frame theme="dark" src={portrait.srcDark} />
    </figure>
  );
}
