import data from "./data/projects.json";

/**
 * Shapes live here, values live in `content/data/projects.json` — see the
 * note at the top of `content/site.ts` for why the two are split.
 */

export type Accent = "build" | "watch";

export type ProjectMedia = {
  src: string;
  alt: string;
  playhead: boolean;
};

export type Project = {
  slug: string;
  index: string;
  timecode: string;
  name: string;
  tagline: string | null;
  taglineIsBengali: boolean;
  cardLine: string;
  accent: Accent;
  meta: { role: string; type: string; stack: string };
  problem: string;
  solution: string;
  solutionPoints: string[];
  challenges: string[];
  architecture: string;
  media: ProjectMedia[];
  links: { label: string; href: string }[];
};

/**
 * The assertion narrows `accent`, which JSON widens from "build" to `string`.
 * It is not a blind cast: the admin panel validates the union before it ever
 * writes this file, so the narrowing is enforced at the one place the data
 * can change rather than re-checked on every read.
 */
export const projects: Project[] = data as Project[];

export const projectSlugs = projects.map((p) => p.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
