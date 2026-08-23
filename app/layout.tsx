import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Manrope,
  Inter_Tight,
  JetBrains_Mono,
  Noto_Sans_Bengali,
} from "next/font/google";
import "./globals.css";
import IntroCurtain from "@/components/IntroCurtain";
import GradeFilters from "@/components/GradeFilters";
import GradePanel from "@/components/GradePanel";
import Timeline from "@/components/Timeline";
import Tilt from "@/components/Tilt";
import RenderEgg from "@/components/RenderEgg";
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
  /* Without metadataBase, Next resolves the OG and Twitter image paths
     against localhost and warns at build. Every share card on the live
     domain depends on this one line. */
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.intro,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.intro,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.intro,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  /* Mobile browser chrome. Matches dark --ink, which is what the site ships
     as; #08090B was left over from the original near-black design. */
  themeColor: "#0e1210",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${accent.variable} ${body.variable} ${mono.variable} ${bengali.variable}`}
    >
      <body>
        <script
          // Applies the stored theme before first paint. Reading this in React
          // instead would render light markup and then repaint dark — a visible
          // flash on every load for dark-mode users.
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}",
          }}
        />
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
      </body>
    </html>
  );
}
