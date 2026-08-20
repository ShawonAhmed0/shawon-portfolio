export type NavLink = { label: string; href: string };

export type SkillGroup = { group: string; items: string[] };

export type EditingWorkItem = {
  id: string;
  title: string;
  category: string;
  image: string;
  href: string | null;
};

export const site = {
  name: "Shawon Ahmed",
  mark: "Shawon Ahmed",
  title: "Shawon — Software Engineer × Performance Creative",
  role: "Software Engineer × Performance Creative",
  intro:
    "I build modern digital products and create high-performing visual experiences.",
  year: "2026",
} as const;

export const portrait = {
  src: "/me/shawon-cutout.png",
  /** Optional looping clip. Set to "/me/shawon-loop.mp4" once you have one. */
  video: "/video/Shawon_vid.mp4" as string | null,
  poster: "/me/shawon-poster.jpg",
  alt: "Shawon",
  slate: "SUBJECT / SHAWON",
};

export const navLinks: NavLink[] = [
  { label: "Work", href: "/#work" },
  { label: "Software", href: "/software" },
  { label: "Creative", href: "/editing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const fork = {
  build: {
    timecode: "00:00:12:04",
    label: "SOFTWARE",
    heading: "BUILD",
    body: "Building modern web applications and AI-powered products.",
    stack: "REACT · NEXT.JS · NODE.JS · POSTGRESQL",
    cta: "VIEW SOFTWARE",
    href: "/software",
  },
  watch: {
    timecode: "00:00:31:18",
    label: "CREATIVE",
    heading: "WATCH",
    body: "Editing performance-focused ads designed to capture attention.",
    stack: "UGC · META ADS · VSL · AI CREATIVE",
    cta: "VIEW CREATIVE",
    href: "/editing",
  },
} as const;

export const engineering = {
  about: [
    "I'm a software developer and creative professional focused on building practical digital products. My background in video editing and performance marketing gives me a different perspective on software—I don't just think about whether a product works, but also how people experience, understand, and engage with it.",
    "I'm currently focused on modern full-stack development, building with technologies like React, Next.js, Node.js, databases, and AI integrations.",
  ],
  skills: [
    {
      group: "FRONTEND",
      items: [
        "React",
        "Next.js",
        "JavaScript",
        "TypeScript",
        "HTML / CSS",
        "Tailwind CSS",
      ],
    },
    { group: "BACKEND", items: ["Node.js", "Express", "NestJS", "REST APIs"] },
    {
      group: "DATABASE & BACKEND SERVICES",
      items: ["MongoDB", "PostgreSQL", "Supabase"],
    },
    {
      group: "TOOLS",
      items: ["Git / GitHub", "VS Code", "API integrations", "AI tools"],
    },
  ] as SkillGroup[],
  resume: { label: "DOWNLOAD RESUME", href: "#", note: "TODO: resume PDF URL" },
};

export const editing = {
  heading: "I edit ads designed to hold attention.",
  subheading: "UGC Ads. VSLs. Meta Ads. Short-Form Content.",
  body: "5+ years of experience creating performance-focused video content for brands and eCommerce.",
  positioning: "Performance Creative Editor",
  emphasis: [
    "Hooks",
    "Retention",
    "Pacing",
    "Pattern interrupts",
    "Visual storytelling",
    "UGC editing",
    "Meta/Facebook ads",
    "VSLs",
    "AI-generated scenes",
    "Creative testing",
  ],
  categories: [
    "All Work",
    "UGC Ads",
    "Meta Ads",
    "VSLs",
    "AI Creative",
    "Short Form",
  ],
  showreelNote: "TODO: showreel embed URL",
  work: [
    {
      id: "relaxe",
      title: "Relaxe — Performance Ad Creative",
      category: "UGC Ads",
      image: "/reel/frame-01.jpg",
      href: "/projects/relaxe-performance-ads",
    },
    {
      id: "w2",
      title: "TODO: Meta ad title",
      category: "Meta Ads",
      image: "/reel/frame-04.jpg",
      href: null,
    },
    {
      id: "w3",
      title: "TODO: VSL title",
      category: "VSLs",
      image: "/reel/frame-06.jpg",
      href: null,
    },
    {
      id: "w4",
      title: "TODO: AI creative title",
      category: "AI Creative",
      image: "/reel/frame-08.jpg",
      href: null,
    },
    {
      id: "w5",
      title: "TODO: short-form title",
      category: "Short Form",
      image: "/reel/frame-10.jpg",
      href: null,
    },
    {
      id: "w6",
      title: "TODO: UGC ad title",
      category: "UGC Ads",
      image: "/reel/frame-12.jpg",
      href: null,
    },
  ] as EditingWorkItem[],
};

export const bridge = {
  timecode: "00:02:14:02",
  label: "WHERE CODE MEETS CREATIVE",
  heading: "TWO CRAFTS, ONE OPERATOR",
  build: {
    label: "SOFTWARE HELPS ME",
    items: [
      "Build products",
      "Understand technical systems",
      "Work with AI/API integrations",
      "Create websites and applications",
    ],
  },
  watch: {
    label: "VIDEO EDITING HELPS ME",
    items: [
      "Understand users",
      "Capture attention",
      "Communicate complex ideas",
      "Create marketing assets",
    ],
  },
};

export const contact = {
  timecode: "00:04:00:00",
  label: "END OF REEL",
  heading: "LET'S WORK TOGETHER",
  email: {
    label: "shawona145@gmail.com",
    href: "mailto:shawona145@gmail.com",
  },
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/ShawonAhmed0",
      external: true,
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/shawonahmedsa",
      external: true,
    },
    {
      label: "Email",
      href: "mailto:shawona145@gmail.com",
      external: false,
    },
  ],
  footerLeft: "SHAWON © 2026",
  footerRight: "BUILT WITH NEXT.JS",
};

export const reelFrames: string[] = Array.from(
  { length: 12 },
  (_, i) => `/reel/frame-${String(i + 1).padStart(2, "0")}.jpg`,
);

export type SectionMark = { code: string; label: string };

export const pageMarks: Record<string, Record<string, SectionMark>> = {
  software: {
    hero: { code: "00:00:12:04", label: "SOFTWARE" },
    about: { code: "00:00:26:11", label: "ABOUT" },
    skills: { code: "00:00:48:02", label: "STACK" },
    projects: { code: "00:01:14:19", label: "PROJECTS" },
    resume: { code: "00:01:38:06", label: "DOCUMENTS" },
  },
  editing: {
    hero: { code: "00:00:31:18", label: "CREATIVE" },
    showreel: { code: "00:00:44:09", label: "SHOWREEL" },
    work: { code: "00:01:02:15", label: "SELECTED WORK" },
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
