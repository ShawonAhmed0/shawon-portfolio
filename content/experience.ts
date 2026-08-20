export type Accent = "build" | "watch";

export type ExperienceRow = {
  period: string;
  accent: Accent;
  title: string;
  tags: string[];
};

export const experience: ExperienceRow[] = [
  {
    period: "2023 — PRESENT",
    accent: "watch",
    title: "Video Editor — E-commerce / Performance Marketing",
    tags: [
      "Meta ads",
      "UGC ads",
      "VSLs",
      "Short-form content",
      "AI-assisted creative production",
    ],
  },
  {
    period: "2024 — PRESENT",
    accent: "build",
    title: "Software Engineering & Product Development",
    tags: [
      "Modern web development",
      "Full-stack applications",
      "Next.js / React",
      "Backend systems",
      "Databases",
      "AI-powered products",
    ],
  },
];
