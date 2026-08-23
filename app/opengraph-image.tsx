import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/**
 * The share card. Without one, the domain renders as a bare link everywhere
 * it gets posted — which is most of how a portfolio actually reaches people.
 *
 * This has no dynamic segment, so Next renders it once at build time rather
 * than per request: the font and portrait reads below happen during the
 * build, and what ships is a static PNG.
 *
 * Satori (what ImageResponse renders with) supports flexbox only, needs an
 * explicit `display: flex` on anything with more than one child, and cannot
 * read woff2 — hence the TTF.
 */

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [font, portrait] = await Promise.all([
    readFile(join(process.cwd(), "assets", "Manrope-ExtraBold.ttf")),
    // PNG, not the .webp the site serves: satori decodes PNG, JPEG and SVG
    // only, and a WebP source fails the whole render with an opaque
    // "u2 is not iterable". This copy exists solely for this card.
    readFile(join(process.cwd(), "assets", "og-portrait.png")),
  ]);

  const portraitSrc = `data:image/png;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0e1210",
          position: "relative",
        }}
      >
        {/* The bloom the hero paints. Two separate layers rather than one
            comma-separated background, and explicit edges rather than `inset`
            — satori parses neither shorthand and fails the whole render. */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(900px 500px at 18% 8%, #1d3b2c 0%, rgba(29,59,44,0) 62%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(700px 460px at 88% 96%, #1f3340 0%, rgba(31,51,64,0) 60%)",
          }}
        />

        {/* Portrait, right, bled off the bottom edge like the hero's. Satori
            renders to a raster, so alt is inert here — the exported `alt`
            above is what actually describes this image to a reader. */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          src={portraitSrc}
          width={446}
          height={630}
          style={{
            position: "absolute",
            right: 74,
            bottom: -40,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 72px",
            width: 700,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 70,
                color: "#edf2ee",
                letterSpacing: "-0.035em",
                whiteSpace: "nowrap",
              }}
            >
              Shawon Ahmed
            </div>
            {/* The wordmark's own track and clip, at card scale: the clip is
                the surname's share of the width, aligned to the end. */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: 16,
                width: 452,
                height: 6,
                background: "#2c332e",
                borderRadius: 99,
              }}
            >
              <div style={{ display: "flex", width: 196, background: "#e8935a", borderRadius: 99 }} />
            </div>
          </div>

          {/* Broken deliberately rather than left to wrap, which orphaned
              "Creative" onto its own line. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 42,
              fontSize: 30,
              color: "#97a49a",
              letterSpacing: "-0.01em",
              lineHeight: 1.3,
            }}
          >
            <div style={{ display: "flex" }}>Software Engineer</div>
            <div style={{ display: "flex" }}>× Performance Creative</div>
          </div>

          <div style={{ display: "flex", marginTop: 54, fontSize: 22, color: "#6c7770", letterSpacing: "0.12em" }}>
            SHAWONAHMED.COM
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Manrope", data: font, weight: 800, style: "normal" }],
    },
  );
}
