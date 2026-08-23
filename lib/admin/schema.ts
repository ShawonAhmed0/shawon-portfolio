import type {
  Bridge,
  Contact,
  EditingSection,
  Engineering,
  ForkPanel,
  NavLink,
  Portrait,
  SiteInfo,
} from "@/content/site";
import type { Project } from "@/content/projects";
import type { ExperienceRow } from "@/content/experience";
import type { Service } from "@/content/services";

/**
 * Validation for everything the admin panel writes.
 *
 * This is stricter than it looks like it needs to be, for one reason: the
 * payload is committed to the repository and Vercel builds from it. A bad
 * shape here does not render a wrong page — it fails `next build` and the
 * live site keeps serving the previous deploy while the user sees a red X
 * and no explanation. Rejecting at the door, with the field path attached, is
 * the difference between "Slug must be lowercase" and a build log.
 *
 * Hand-rolled rather than a schema library because the shapes are small,
 * fixed, and adding a dependency was not on the table.
 */

export type SiteData = {
  site: SiteInfo;
  portrait: Portrait;
  navLinks: NavLink[];
  fork: { build: ForkPanel; watch: ForkPanel };
  engineering: Engineering;
  editing: EditingSection;
  bridge: Bridge;
  contact: Contact;
};

export type ContentBundle = {
  site: SiteData;
  projects: Project[];
  experience: ExperienceRow[];
  services: Service[];
};

export class ValidationError extends Error {
  constructor(public issues: string[]) {
    super(issues.join("; "));
  }
}

class Check {
  issues: string[] = [];

  fail(path: string, message: string): void {
    this.issues.push(`${path}: ${message}`);
  }

  obj(path: string, value: unknown): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      this.fail(path, "expected an object");
      return {};
    }
    return value as Record<string, unknown>;
  }

  /** A string that must carry content — the common case for copy fields. */
  str(path: string, value: unknown, { allowEmpty = false } = {}): string {
    if (typeof value !== "string") {
      this.fail(path, "expected text");
      return "";
    }
    const trimmed = value.trim();
    if (!allowEmpty && trimmed.length === 0) this.fail(path, "cannot be empty");
    // Stored trimmed so a stray space cannot change whether two saves differ,
    // which would otherwise produce empty commits.
    return trimmed;
  }

  nullableStr(path: string, value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const s = this.str(path, value, { allowEmpty: true });
    return s.length === 0 ? null : s;
  }

  bool(path: string, value: unknown): boolean {
    if (typeof value !== "boolean") {
      this.fail(path, "expected true or false");
      return false;
    }
    return value;
  }

  arr(path: string, value: unknown): unknown[] {
    if (!Array.isArray(value)) {
      this.fail(path, "expected a list");
      return [];
    }
    return value;
  }

  /** Free-text list fields drop blank rows rather than rejecting them: an
   *  empty row is what a half-finished "add item" click leaves behind. */
  strList(path: string, value: unknown): string[] {
    return this.arr(path, value)
      .map((item, i) => this.str(`${path}[${i}]`, item, { allowEmpty: true }))
      .filter((s) => s.length > 0);
  }

  accent(path: string, value: unknown): "build" | "watch" {
    if (value !== "build" && value !== "watch") {
      this.fail(path, 'must be either "build" or "watch"');
      return "build";
    }
    return value;
  }

  /** Any href the site will render. Blocks the schemes that turn a content
   *  field into script execution on the live page. */
  href(path: string, value: unknown, { allowEmpty = false } = {}): string {
    const raw = this.str(path, value, { allowEmpty });
    if (raw.length === 0) return raw;
    if (/^(javascript|data|vbscript):/i.test(raw.replace(/\s/g, ""))) {
      this.fail(path, "that link scheme is not allowed");
      return "#";
    }
    return raw;
  }

  /** A path under /public. Must be site-absolute, and must not climb out. */
  assetPath(path: string, value: unknown): string {
    const raw = this.str(path, value);
    if (raw.length === 0) return raw;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (!raw.startsWith("/")) {
      this.fail(path, "must start with / or be a full https:// URL");
      return raw;
    }
    if (raw.includes("..")) {
      this.fail(path, "cannot contain ..");
      return raw;
    }
    return raw;
  }

  slug(path: string, value: unknown): string {
    const raw = this.str(path, value);
    if (raw.length === 0) return raw;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw)) {
      this.fail(path, "lowercase letters, numbers and single hyphens only");
    }
    return raw;
  }

  done(): void {
    if (this.issues.length > 0) throw new ValidationError(this.issues);
  }
}

function forkPanel(c: Check, path: string, value: unknown): ForkPanel {
  const o = c.obj(path, value);
  return {
    timecode: c.str(`${path}.timecode`, o.timecode),
    label: c.str(`${path}.label`, o.label),
    heading: c.str(`${path}.heading`, o.heading),
    body: c.str(`${path}.body`, o.body),
    stack: c.str(`${path}.stack`, o.stack),
    cta: c.str(`${path}.cta`, o.cta),
    href: c.href(`${path}.href`, o.href),
  };
}

function bridgeColumn(c: Check, path: string, value: unknown) {
  const o = c.obj(path, value);
  return {
    label: c.str(`${path}.label`, o.label),
    items: c.strList(`${path}.items`, o.items),
  };
}

export function parseSite(input: unknown, c = new Check()): SiteData {
  const o = c.obj("site", input);
  const s = c.obj("site.site", o.site);
  const p = c.obj("site.portrait", o.portrait);
  const f = c.obj("site.fork", o.fork);
  const e = c.obj("site.engineering", o.engineering);
  const ed = c.obj("site.editing", o.editing);
  const b = c.obj("site.bridge", o.bridge);
  const ct = c.obj("site.contact", o.contact);
  const resume = c.obj("site.engineering.resume", e.resume);
  const email = c.obj("site.contact.email", ct.email);

  const url = c.str("site.site.url", s.url);
  if (url.length > 0 && !/^https?:\/\/[^/]+$/.test(url)) {
    // A trailing slash here doubles up in every canonical and OG URL the
    // site emits, and a path segment corrupts all of them.
    c.fail("site.site.url", "must be a bare origin like https://example.com");
  }

  return {
    site: {
      url,
      name: c.str("site.site.name", s.name),
      mark: c.str("site.site.mark", s.mark),
      title: c.str("site.site.title", s.title),
      role: c.str("site.site.role", s.role),
      intro: c.str("site.site.intro", s.intro),
      year: c.str("site.site.year", s.year),
    },
    portrait: {
      src: c.assetPath("site.portrait.src", p.src),
      srcDark: c.assetPath("site.portrait.srcDark", p.srcDark),
      alt: c.str("site.portrait.alt", p.alt),
      slate: c.str("site.portrait.slate", p.slate),
    },
    navLinks: c.arr("site.navLinks", o.navLinks).map((item, i) => {
      const n = c.obj(`site.navLinks[${i}]`, item);
      return {
        label: c.str(`site.navLinks[${i}].label`, n.label),
        href: c.href(`site.navLinks[${i}].href`, n.href),
      };
    }),
    fork: {
      build: forkPanel(c, "site.fork.build", f.build),
      watch: forkPanel(c, "site.fork.watch", f.watch),
    },
    engineering: {
      about: c.strList("site.engineering.about", e.about),
      skills: c.arr("site.engineering.skills", e.skills).map((item, i) => {
        const g = c.obj(`site.engineering.skills[${i}]`, item);
        return {
          group: c.str(`site.engineering.skills[${i}].group`, g.group),
          items: c.strList(`site.engineering.skills[${i}].items`, g.items),
        };
      }),
      resume: {
        label: c.str("site.engineering.resume.label", resume.label),
        href: c.href("site.engineering.resume.href", resume.href),
        note: c.str("site.engineering.resume.note", resume.note, { allowEmpty: true }),
      },
    },
    editing: {
      heading: c.str("site.editing.heading", ed.heading),
      subheading: c.str("site.editing.subheading", ed.subheading),
      body: c.str("site.editing.body", ed.body),
      positioning: c.str("site.editing.positioning", ed.positioning),
      emphasis: c.strList("site.editing.emphasis", ed.emphasis),
      categories: c.strList("site.editing.categories", ed.categories),
      showreelUrl: c.href("site.editing.showreelUrl", ed.showreelUrl, { allowEmpty: true }),
      showreelNote: c.str("site.editing.showreelNote", ed.showreelNote, { allowEmpty: true }),
      work: c.arr("site.editing.work", ed.work).map((item, i) => {
        const w = c.obj(`site.editing.work[${i}]`, item);
        return {
          id: c.str(`site.editing.work[${i}].id`, w.id),
          title: c.str(`site.editing.work[${i}].title`, w.title),
          category: c.str(`site.editing.work[${i}].category`, w.category),
          image: c.assetPath(`site.editing.work[${i}].image`, w.image),
          href: w.href === null || w.href === undefined || w.href === ""
            ? null
            : c.href(`site.editing.work[${i}].href`, w.href),
        };
      }),
    },
    bridge: {
      timecode: c.str("site.bridge.timecode", b.timecode),
      label: c.str("site.bridge.label", b.label),
      heading: c.str("site.bridge.heading", b.heading),
      build: bridgeColumn(c, "site.bridge.build", b.build),
      watch: bridgeColumn(c, "site.bridge.watch", b.watch),
    },
    contact: {
      timecode: c.str("site.contact.timecode", ct.timecode),
      label: c.str("site.contact.label", ct.label),
      heading: c.str("site.contact.heading", ct.heading),
      email: {
        label: c.str("site.contact.email.label", email.label),
        href: c.href("site.contact.email.href", email.href),
      },
      socials: c.arr("site.contact.socials", ct.socials).map((item, i) => {
        const so = c.obj(`site.contact.socials[${i}]`, item);
        return {
          label: c.str(`site.contact.socials[${i}].label`, so.label),
          href: c.href(`site.contact.socials[${i}].href`, so.href),
          external: c.bool(`site.contact.socials[${i}].external`, so.external),
        };
      }),
      footerLeft: c.str("site.contact.footerLeft", ct.footerLeft),
      footerRight: c.str("site.contact.footerRight", ct.footerRight),
    },
  };
}

export function parseProjects(input: unknown, c = new Check()): Project[] {
  const list = c.arr("projects", input).map((item, i) => {
    const o = c.obj(`projects[${i}]`, item);
    const meta = c.obj(`projects[${i}].meta`, o.meta);
    return {
      slug: c.slug(`projects[${i}].slug`, o.slug),
      index: c.str(`projects[${i}].index`, o.index),
      timecode: c.str(`projects[${i}].timecode`, o.timecode),
      name: c.str(`projects[${i}].name`, o.name),
      tagline: c.nullableStr(`projects[${i}].tagline`, o.tagline),
      taglineIsBengali: c.bool(`projects[${i}].taglineIsBengali`, o.taglineIsBengali),
      cardLine: c.str(`projects[${i}].cardLine`, o.cardLine),
      accent: c.accent(`projects[${i}].accent`, o.accent),
      meta: {
        role: c.str(`projects[${i}].meta.role`, meta.role),
        type: c.str(`projects[${i}].meta.type`, meta.type),
        stack: c.str(`projects[${i}].meta.stack`, meta.stack),
      },
      problem: c.str(`projects[${i}].problem`, o.problem),
      solution: c.str(`projects[${i}].solution`, o.solution),
      solutionPoints: c.strList(`projects[${i}].solutionPoints`, o.solutionPoints),
      challenges: c.strList(`projects[${i}].challenges`, o.challenges),
      architecture: c.str(`projects[${i}].architecture`, o.architecture),
      media: c.arr(`projects[${i}].media`, o.media).map((m, j) => {
        const mo = c.obj(`projects[${i}].media[${j}]`, m);
        return {
          src: c.assetPath(`projects[${i}].media[${j}].src`, mo.src),
          alt: c.str(`projects[${i}].media[${j}].alt`, mo.alt),
          playhead: c.bool(`projects[${i}].media[${j}].playhead`, mo.playhead),
        };
      }),
      links: c.arr(`projects[${i}].links`, o.links).map((l, j) => {
        const lo = c.obj(`projects[${i}].links[${j}]`, l);
        return {
          label: c.str(`projects[${i}].links[${j}].label`, lo.label),
          href: c.href(`projects[${i}].links[${j}].href`, lo.href),
        };
      }),
    };
  });

  // Slugs are routes. Two projects sharing one means `/projects/x` renders
  // whichever `find` reaches first and the other becomes unreachable — a
  // silent disappearance rather than an error, so it is caught here.
  const seen = new Set<string>();
  for (const project of list) {
    if (project.slug.length === 0) continue;
    if (seen.has(project.slug)) {
      c.fail("projects", `two projects share the slug "${project.slug}"`);
    }
    seen.add(project.slug);
  }

  return list;
}

export function parseExperience(input: unknown, c = new Check()): ExperienceRow[] {
  return c.arr("experience", input).map((item, i) => {
    const o = c.obj(`experience[${i}]`, item);
    return {
      period: c.str(`experience[${i}].period`, o.period),
      accent: c.accent(`experience[${i}].accent`, o.accent),
      title: c.str(`experience[${i}].title`, o.title),
      tags: c.strList(`experience[${i}].tags`, o.tags),
    };
  });
}

export function parseServices(input: unknown, c = new Check()): Service[] {
  return c.arr("services", input).map((item, i) => {
    const o = c.obj(`services[${i}]`, item);
    return {
      name: c.str(`services[${i}].name`, o.name),
      description: c.str(`services[${i}].description`, o.description),
    };
  });
}

/** Validates a whole bundle at once so a save reports every problem, not the first. */
export function parseBundle(input: unknown): ContentBundle {
  const c = new Check();
  const o = c.obj("bundle", input);
  const bundle = {
    site: parseSite(o.site, c),
    projects: parseProjects(o.projects, c),
    experience: parseExperience(o.experience, c),
    services: parseServices(o.services, c),
  };
  c.done();
  return bundle;
}
