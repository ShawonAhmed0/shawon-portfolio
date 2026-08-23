import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { projects } from "@/content/projects";

/**
 * Derived from the content, not hand-listed: a new project appears in the
 * sitemap because it exists, not because someone remembered to add it here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = ["", "/software", "/editing", "/about", "/contact"].map(
    (path) => ({
      url: `${site.url}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      // The home page is the one that should rank; the rest support it.
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const cases = projects.map((project) => ({
    url: `${site.url}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...routes, ...cases];
}
