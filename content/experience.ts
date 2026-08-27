import data from "./data/experience.json";

export type Accent = "build" | "watch";

export type ExperienceRow = {
  period: string;
  /** "Full-time", "Part-time", "Freelance". Optional — an empty string simply
   *  renders nothing, so older rows need no backfill. */
  employment: string;
  accent: Accent;
  title: string;
  tags: string[];
};

/** See `content/projects.ts` for why the accent is asserted rather than parsed. */
export const experience: ExperienceRow[] = data as ExperienceRow[];
