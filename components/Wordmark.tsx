import { site } from "@/content/site";

/**
 * The wordmark: the name riding a transport track, with the surname as the
 * active clip.
 *
 * Same shape language as the favicon and the timeline, so the identity is one
 * idea rather than three. Chosen over the alternative — a playhead parked
 * between the two names — because that version's line went sub-pixel at the
 * 18px the nav actually renders at, and a half-lit surname read as disabled
 * rather than as unplayed. Its motion survives here instead: the clip places
 * itself on load.
 *
 * The clip's width is not a number. It is drawn by the surname's own span, so
 * it stays locked to the letterforms at any size or font-size, rather than a
 * percentage that only looked right at the width it was eyeballed against.
 */
export default function Wordmark({ className }: { className?: string }) {
  // Split on the LAST space: a middle name should ride with the first, since
  // the clip marks the surname.
  const cut = site.mark.lastIndexOf(" ");
  const first = cut === -1 ? site.mark : site.mark.slice(0, cut);
  const last = cut === -1 ? "" : site.mark.slice(cut + 1);

  return (
    <span className={`wordmark ${className ?? ""}`}>
      {first}
      {last ? (
        <>
          {" "}
          <span className="wordmark-clip">{last}</span>
        </>
      ) : null}
    </span>
  );
}
