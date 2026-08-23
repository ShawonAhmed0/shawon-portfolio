import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Manrope,
  Inter_Tight,
  JetBrains_Mono,
  Noto_Sans_Bengali,
} from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";
import JsonLd from "@/components/JsonLd";
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
  /* Template applies to every child that sets a title, so pages carry a short
     one — "Web Developer" — and the name is appended once, here. */
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.intro,
  /* Deliberately no `alternates` and no `openGraph.url`.
     Metadata is inherited, so a canonical set here becomes every page's
     canonical unless it overrides — which pointed all eight sub-pages at the
     home page and asked search engines to drop them. Left unset, a page that
     forgets gets no canonical at all: neutral, rather than actively wrong.
     Each page builds its own through `pageMetadata` in lib/seo.ts. */
  openGraph: {
    type: "website",
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
        <JsonLd />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
