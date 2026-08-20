import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Manrope,
  Inter_Tight,
  JetBrains_Mono,
  Noto_Sans_Bengali,
} from "next/font/google";
import "./globals.css";
import ScrubBar from "@/components/ScrubBar";
import PlayheadCursor from "@/components/PlayheadCursor";
import { site } from "@/content/site";

// Modern variable grotesque. Tight tracking at display weight is what reads
// expensive here — not a heavy condensed face, and not an editorial serif.
const display = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

// Used for a single italic phrase in the headline, never for running text.
const accent = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
  variable: "--font-accent",
  display: "swap",
});

const body = Inter_Tight({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: site.title,
  description: site.intro,
};

export const viewport: Viewport = {
  themeColor: "#08090B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${accent.variable} ${body.variable} ${mono.variable} ${bengali.variable}`}
    >
      <body>
        {children}
        {/*
          soft-light, not overlay: against a near-black ground, overlay
          multiplies the noise down to nothing. soft-light lifts it into
          visible texture.
        */}
        <div
          aria-hidden
          className="grain pointer-events-none fixed inset-0 z-[60] opacity-[0.05] mix-blend-multiply"
        />
        <ScrubBar />
        <PlayheadCursor />
      </body>
    </html>
  );
}
