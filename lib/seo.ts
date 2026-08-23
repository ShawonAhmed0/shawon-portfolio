import type { Metadata } from "next";
import { site } from "@/content/site";

/**
 * Builds a page's metadata as a complete unit.
 *
 * Next merges metadata shallowly, and `openGraph` is replaced rather than
 * merged — a page that sets only `openGraph.url` silently loses the site
 * name, type and locale from the parent. Worse is setting nothing: the page
 * then inherits the root's `canonical` and `og:url`, and every URL on the
 * site declares itself a duplicate of the home page, which is an instruction
 * to search engines to drop it from the index.
 *
 * So every page builds the whole object here rather than patching pieces of
 * an inherited one. The cost is one function call per page; the alternative
 * cost was eight pages that could not rank.
 *
 * `og:image` is not set here on purpose — it comes from the
 * `opengraph-image` file convention, which Next applies per route segment
 * and which would be overwritten by an explicit `images` key.
 */
export function pageMetadata({
  path,
  title,
  description,
}: {
  /** Site-absolute, e.g. "/software". Resolved against metadataBase. */
  path: string;
  /** The page's own title. Omit on the home page to use the site title. */
  title?: string;
  description: string;
}): Metadata {
  // Mirrors the template in the root layout, because og:title does not pass
  // through it — a template only rewrites the <title> tag.
  const full = title ? `${title} — ${site.name}` : site.title;

  return {
    /* Spread rather than `title` directly: passing `title: undefined` does
       not fall through to the layout's default, it suppresses the tag, and
       the home page shipped with no <title> at all. Omitting the key is what
       lets the default apply. */
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: site.name,
      title: full,
      description,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
    },
  };
}
