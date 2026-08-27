import data from "./data/site.json";

/**
 * The site's copy lives in `content/data/*.json`, not in this file. This
 * module is the typed door onto it: every export below has an explicit
 * annotation, so a JSON import — which TypeScript widens to `string` and
 * `string[]` — still reaches the pages as a precise shape.
 *
 * The split exists so the admin panel at /admin can rewrite the content
 * without codegen. Editing a TypeScript literal from a form means printing
 * source; editing JSON means `JSON.stringify`. Nothing that reads from here
 * changed when the data moved.
 */

export type NavLink = { label: string; href: string };

export type SkillGroup = { group: string; items: string[] };

export type EditingWorkItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  href: string | null;
};

export type SiteInfo = {
  /** Canonical origin. Every absolute URL the site emits derives from this,
   *  so a domain change is one edit rather than a search across metadata,
   *  the sitemap and robots. */
  url: string;
  name: string;
  mark: string;
  title: string;
  role: string;
  intro: string;
  year: string;
};

export type Portrait = {
  src: string;
  srcDark: string;
  alt: string;
  slate: string;
};

export type ForkPanel = {
  timecode: string;
  label: string;
  heading: string;
  body: string;
  stack: string;
  cta: string;
  href: string;
};

export type Engineering = {
  about: string[];
  skills: SkillGroup[];
  resume: { label: string; href: string; note: string };
};

export type EditingSection = {
  heading: string;
  subheading: string;
  body: string;
  positioning: string;
  /** An external credential shown under the positioning line, with the
   *  figures that back it. An empty label hides the whole block, and an
   *  empty `stats` hides just the figures — nothing is asserted unless it
   *  has been filled in. */
  credential: {
    label: string;
    href: string;
    stats: { value: string; label: string }[];
  };
  emphasis: string[];
  categories: string[];
  /** A YouTube or Vimeo link. Empty means the showreel slot stays a
   *  placeholder showing `showreelNote` instead. */
  showreelUrl: string;
  showreelNote: string;
  /** Empty list hides the section entirely. */
  testimonials: Testimonial[];
  work: EditingWorkItem[];
};

export type Testimonial = {
  quote: string;
  /** May be empty — clients often review without a public name. */
  author: string;
  /** What the work was, so the quote has something to attach to. */
  context: string;
  date: string;
  /** Where it was left, e.g. "Upwork". Named so the claim is checkable. */
  source: string;
};

export type BridgeColumn = { label: string; items: string[] };

export type Bridge = {
  timecode: string;
  label: string;
  heading: string;
  build: BridgeColumn;
  watch: BridgeColumn;
};

export type SocialLink = { label: string; href: string; external: boolean };

export type Contact = {
  timecode: string;
  label: string;
  heading: string;
  email: { label: string; href: string };
  socials: SocialLink[];
  footerLeft: string;
  footerRight: string;
};

export const site: SiteInfo = data.site;

/**
 * Two cutouts of the same head-and-shoulders setup, one per ground: sage knit
 * lit bright for paper, black knit lit moody for ink. Same 900x1272 frame,
 * which is what lets the hero box stay identical across a theme change and
 * lets the two cross-fade in place.
 *
 * The light cut is REGISTERED to the dark one, not used as generated: as shot
 * its face sat 22px right and 30px low at a 4.75% smaller scale, which the
 * cross-fade showed as the head jumping and resizing. Correcting it lifted
 * normalised cross-correlation over the face from 0.53 to 0.86 (residual: a
 * 0.25% scale and 2px, roughly one screen pixel at render size). To redo it
 * from a fresh source, solve for the transform again rather than reusing
 * these numbers — they are specific to this pair.
 */
export const portrait: Portrait = data.portrait;

export const navLinks: NavLink[] = data.navLinks;

export const fork: { build: ForkPanel; watch: ForkPanel } = data.fork;

export const engineering: Engineering = data.engineering;

export const editing: EditingSection = data.editing;

export const bridge: Bridge = data.bridge;

export const contact: Contact = data.contact;

export const reelFrames: string[] = Array.from(
  { length: 12 },
  (_, i) => `/reel/frame-${String(i + 1).padStart(2, "0")}.jpg`,
);

export type SectionMark = { code: string; label: string };

/**
 * Structural, not copy: these keys are wired to section ids in the page
 * components, so they stay in source rather than moving to the editable
 * JSON where a rename would silently unhook a mark from its section.
 */
export const pageMarks: Record<string, Record<string, SectionMark>> = {
  software: {
    hero: { code: "00:00:12:04", label: "SOFTWARE" },
    about: { code: "00:00:26:11", label: "ABOUT" },
    skills: { code: "00:00:48:02", label: "STACK" },
    experience: { code: "00:01:01:08", label: "TIMELINE" },
    projects: { code: "00:01:14:19", label: "PROJECTS" },
    resume: { code: "00:01:38:06", label: "DOCUMENTS" },
  },
  editing: {
    hero: { code: "00:00:31:18", label: "CREATIVE" },
    showreel: { code: "00:00:44:09", label: "SHOWREEL" },
    work: { code: "00:01:02:15", label: "SELECTED WORK" },
    testimonials: { code: "00:01:48:06", label: "CLIENT FEEDBACK" },
    services: { code: "00:02:20:04", label: "SERVICES" },
    experience: { code: "00:03:06:19", label: "TIMELINE" },
  },
  about: {
    hero: { code: "00:00:06:00", label: "ABOUT" },
    experience: { code: "00:03:06:19", label: "TIMELINE" },
  },
  project: {
    header: { code: "00:01:08:16", label: "CASE STUDY" },
    problem: { code: "00:01:20:00", label: "PROBLEM" },
    solution: { code: "00:01:34:12", label: "SOLUTION" },
    challenges: { code: "00:01:49:08", label: "KEY CHALLENGES" },
    architecture: { code: "00:02:04:21", label: "ARCHITECTURE" },
    media: { code: "00:02:22:03", label: "FRAMES" },
    links: { code: "00:02:40:00", label: "LINKS" },
  },
};
