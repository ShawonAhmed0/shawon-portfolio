import { contact, portrait, site } from "@/content/site";

/**
 * Structured data describing who this site is about.
 *
 * The target searches are name-plus-role — "shawon ahmed web developer" —
 * and several other people share the name. What decides those results is
 * whether a search engine can tell the entities apart, so this states the
 * identity outright and lists the profiles that belong to the same person.
 *
 * `sameAs` is the load-bearing part. It is derived from the contact links
 * rather than hard-coded, so adding a profile in the editor adds it here too
 * — and so this file can never point at a profile that is not really his,
 * which for a common name would be worse than listing nothing.
 */
export default function JsonLd() {
  const profiles = contact.socials
    .filter((link) => link.external && /^https?:\/\//i.test(link.href))
    .map((link) => link.href);

  const graph = [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      url: site.url,
      // Both literal phrases, because both are separate searches.
      jobTitle: ["Web Developer", "Video Editor"],
      description: site.intro,
      image: `${site.url}${portrait.srcDark}`,
      ...(profiles.length > 0 ? { sameAs: profiles } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.intro,
      inLanguage: "en",
      publisher: { "@id": `${site.url}/#person` },
    },
  ];

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is data, not markup, and the values come from
      // our own content rather than user input. The `<` escape is belt and
      // braces against a stray "</script>" inside a copy field.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(
          /</g,
          "\\u003c",
        ),
      }}
    />
  );
}
