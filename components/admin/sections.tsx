"use client";

import type { Project } from "@/content/projects";
import type { ExperienceRow } from "@/content/experience";
import type { Service } from "@/content/services";
import type { SiteData } from "@/lib/admin/schema";
import { Area, Card, Repeater, Select, StringList, Text, Toggle } from "./fields";
import ImageField from "./ImageField";

/**
 * One editor per area of the site.
 *
 * Each takes its slice of the bundle and a setter for that slice. They never
 * reach outside it, so the panel can compose them in any order and the save
 * still sees one coherent object.
 *
 * The grouping follows the site's pages rather than the JSON's shape — someone
 * editing the site is thinking "the software page", not "the engineering key".
 */

const ACCENTS = [
  { value: "build" as const, label: "Build (green — software)" },
  { value: "watch" as const, label: "Watch (orange — creative)" },
];

type Patch<T> = (patch: Partial<T>) => void;

/* ── Identity ───────────────────────────────────────────────────────────── */

export function IdentitySection({
  value,
  onChange,
}: {
  value: SiteData;
  onChange: Patch<SiteData>;
}) {
  const site = value.site;
  const portrait = value.portrait;
  const set = (patch: Partial<typeof site>) => onChange({ site: { ...site, ...patch } });
  const setPortrait = (patch: Partial<typeof portrait>) =>
    onChange({ portrait: { ...portrait, ...patch } });

  return (
    <>
      <Card title="Who this is">
        <div className="ad-row ad-row-2">
          <Text label="Name" value={site.name} onChange={(name) => set({ name })} />
          <Text
            label="Wordmark"
            value={site.mark}
            onChange={(mark) => set({ mark })}
            hint="Shown in the nav. The last word gets the orange clip."
          />
        </div>
        <Text
          label="Browser tab title"
          value={site.title}
          onChange={(title) => set({ title })}
          hint="Also the headline on every share card."
        />
        <Text label="Role line" value={site.role} onChange={(role) => set({ role })} />
        <Area
          label="Intro"
          value={site.intro}
          onChange={(intro) => set({ intro })}
          rows={3}
          hint="The meta description search engines and social previews show."
        />
        <div className="ad-row ad-row-2">
          <Text label="Year" value={site.year} onChange={(year) => set({ year })} />
          <Text
            label="Site URL"
            value={site.url}
            onChange={(url) => set({ url })}
            hint="Origin only, no trailing slash. Every canonical and share URL is built from this."
          />
        </div>
      </Card>

      <Card title="Portrait">
        <p className="ad-hint">
          Two cuts of the same framing, one per theme. They cross-fade in place, so
          replacing only one will make the head jump when the theme is switched —
          swap both, shot the same way, or leave them alone.
        </p>
        <div className="ad-row ad-row-2">
          <ImageField
            label="Light theme"
            value={portrait.src}
            onChange={(src) => setPortrait({ src })}
            folder="me"
            basename="portrait-light"
          />
          <ImageField
            label="Dark theme"
            value={portrait.srcDark}
            onChange={(srcDark) => setPortrait({ srcDark })}
            folder="me"
            basename="portrait-dark"
          />
        </div>
        <div className="ad-row ad-row-2">
          <Text
            label="Alt text"
            value={portrait.alt}
            onChange={(alt) => setPortrait({ alt })}
            hint="What a screen reader announces."
          />
          <Text
            label="Slate"
            value={portrait.slate}
            onChange={(slate) => setPortrait({ slate })}
            hint="The small caption on the frame."
          />
        </div>
      </Card>

      <Card title="Navigation">
        <Repeater
          items={value.navLinks}
          onChange={(navLinks) => onChange({ navLinks })}
          blank={() => ({ label: "New link", href: "/" })}
          title={(item) => item.label}
          addLabel="Add nav link"
          render={(item, update) => (
            <div className="ad-row ad-row-2">
              <Text label="Label" value={item.label} onChange={(label) => update({ label })} />
              <Text label="Href" value={item.href} onChange={(href) => update({ href })} />
            </div>
          )}
        />
      </Card>
    </>
  );
}

/* ── Home ───────────────────────────────────────────────────────────────── */

export function HomeSection({
  value,
  onChange,
}: {
  value: SiteData;
  onChange: Patch<SiteData>;
}) {
  const fork = value.fork;
  const bridge = value.bridge;

  const panel = (key: "build" | "watch") => {
    const p = fork[key];
    const set = (patch: Partial<typeof p>) =>
      onChange({ fork: { ...fork, [key]: { ...p, ...patch } } });
    return (
      <Card title={key === "build" ? "Left panel — software" : "Right panel — creative"}>
        <div className="ad-row ad-row-2">
          <Text label="Heading" value={p.heading} onChange={(heading) => set({ heading })} />
          <Text label="Label" value={p.label} onChange={(label) => set({ label })} />
        </div>
        <Area label="Body" value={p.body} onChange={(body) => set({ body })} rows={3} />
        <Text
          label="Stack line"
          value={p.stack}
          onChange={(stack) => set({ stack })}
          hint="Separate items with ·"
        />
        <div className="ad-row ad-row-2">
          <Text label="Button text" value={p.cta} onChange={(cta) => set({ cta })} />
          <Text label="Button link" value={p.href} onChange={(href) => set({ href })} />
        </div>
        <Text
          label="Timecode"
          value={p.timecode}
          onChange={(timecode) => set({ timecode })}
          hint="Shown by the section marker and used by the transport bar."
        />
      </Card>
    );
  };

  const column = (key: "build" | "watch") => {
    const col = bridge[key];
    const set = (patch: Partial<typeof col>) =>
      onChange({ bridge: { ...bridge, [key]: { ...col, ...patch } } });
    return (
      <>
        <Text label={`${key} column label`} value={col.label} onChange={(label) => set({ label })} />
        <StringList
          label={`${key} column items`}
          value={col.items}
          onChange={(items) => set({ items })}
          addLabel="Add item"
        />
      </>
    );
  };

  return (
    <>
      {panel("build")}
      {panel("watch")}
      <Card title="The bridge — two crafts, one operator">
        <div className="ad-row ad-row-2">
          <Text
            label="Heading"
            value={bridge.heading}
            onChange={(heading) => onChange({ bridge: { ...bridge, heading } })}
          />
          <Text
            label="Label"
            value={bridge.label}
            onChange={(label) => onChange({ bridge: { ...bridge, label } })}
          />
        </div>
        <Text
          label="Timecode"
          value={bridge.timecode}
          onChange={(timecode) => onChange({ bridge: { ...bridge, timecode } })}
        />
        {column("build")}
        {column("watch")}
      </Card>
    </>
  );
}

/* ── Software page ──────────────────────────────────────────────────────── */

export function SoftwareSection({
  value,
  onChange,
}: {
  value: SiteData;
  onChange: Patch<SiteData>;
}) {
  const eng = value.engineering;
  const set = (patch: Partial<typeof eng>) => onChange({ engineering: { ...eng, ...patch } });

  return (
    <>
      <Card title="About">
        <StringList
          label="Paragraphs"
          value={eng.about}
          onChange={(about) => set({ about })}
          addLabel="Add paragraph"
          multiline
        />
      </Card>

      <Card title="Stack">
        <Repeater
          items={eng.skills}
          onChange={(skills) => set({ skills })}
          blank={() => ({ group: "NEW GROUP", items: [] })}
          title={(item) => `${item.group} (${item.items.length})`}
          addLabel="Add group"
          render={(item, update) => (
            <>
              <Text label="Group name" value={item.group} onChange={(group) => update({ group })} />
              <StringList
                label="Items"
                value={item.items}
                onChange={(items) => update({ items })}
                addLabel="Add item"
              />
            </>
          )}
        />
      </Card>

      <Card title="Resume">
        <div className="ad-row ad-row-2">
          <Text
            label="Button text"
            value={eng.resume.label}
            onChange={(label) => set({ resume: { ...eng.resume, label } })}
          />
          <Text
            label="File URL"
            value={eng.resume.href}
            onChange={(href) => set({ resume: { ...eng.resume, href } })}
            hint="Link to a hosted PDF. Upload it to Drive or Dropbox and paste the share link."
          />
        </div>
        <Text
          label="Note under the button"
          value={eng.resume.note}
          onChange={(note) => set({ resume: { ...eng.resume, note } })}
          hint="Leave empty to hide it."
        />
      </Card>
    </>
  );
}

/* ── Creative page ──────────────────────────────────────────────────────── */

export function CreativeSection({
  value,
  onChange,
}: {
  value: SiteData;
  onChange: Patch<SiteData>;
}) {
  const ed = value.editing;
  const set = (patch: Partial<typeof ed>) => onChange({ editing: { ...ed, ...patch } });

  return (
    <>
      <Card title="Header">
        <Text label="Heading" value={ed.heading} onChange={(heading) => set({ heading })} />
        <Text label="Subheading" value={ed.subheading} onChange={(subheading) => set({ subheading })} />
        <Area label="Body" value={ed.body} onChange={(body) => set({ body })} rows={3} />
        <Text label="Positioning" value={ed.positioning} onChange={(positioning) => set({ positioning })} />
        <div className="ad-row ad-row-2">
          <Text
            label="Credential"
            value={ed.credential.label}
            onChange={(label) => set({ credential: { ...ed.credential, label } })}
            hint="e.g. Top Rated on Upwork. Leave both empty to hide it."
          />
          <Text
            label="Credential link"
            value={ed.credential.href}
            onChange={(href) => set({ credential: { ...ed.credential, href } })}
          />
        </div>
        <div className="ad-field">
          <span className="ad-label">Credential figures</span>
          <span className="ad-hint">
            Copy these from the source exactly, using its own wording. An
            unverifiable number on a portfolio is worse than no number.
          </span>
          <Repeater
            items={ed.credential.stats}
            onChange={(stats) => set({ credential: { ...ed.credential, stats } })}
            blank={() => ({ value: "", label: "" })}
            title={(item) => `${item.value} ${item.label}`.trim() || "New figure"}
            addLabel="Add figure"
            render={(item, update) => (
              <div className="ad-row ad-row-2">
                <Text label="Value" value={item.value} onChange={(value) => update({ value })} />
                <Text label="Label" value={item.label} onChange={(label) => update({ label })} />
              </div>
            )}
          />
        </div>
        <StringList
          label="Emphasis tags"
          value={ed.emphasis}
          onChange={(emphasis) => set({ emphasis })}
          addLabel="Add tag"
        />
      </Card>

      <Card title="Showreel">
        <Text
          label="Video link"
          value={ed.showreelUrl}
          onChange={(showreelUrl) => set({ showreelUrl })}
          placeholder="https://youtube.com/watch?v=…"
          hint="Paste a normal YouTube or Vimeo link — the share URL or the one in the address bar. It becomes a player automatically. Leave empty to show the placeholder text below instead."
        />
        <Text
          label="Placeholder text"
          value={ed.showreelNote}
          onChange={(showreelNote) => set({ showreelNote })}
          hint="Only visible while no video link is set."
        />
      </Card>

      <Card title="Client feedback">
        <p className="ad-hint">
          Quote reviews exactly as they were written, including any awkward
          phrasing. A tidied-up quote is no longer a quote, and naming the
          source is what makes it checkable.
        </p>
        <Repeater
          items={ed.testimonials}
          onChange={(testimonials) => set({ testimonials })}
          blank={() => ({ quote: "", author: "", context: "", date: "", source: "Upwork" })}
          title={(item) => item.author || item.quote.slice(0, 40) || "New review"}
          addLabel="Add review"
          render={(item, update) => (
            <>
              <Area
                label="Quote"
                value={item.quote}
                onChange={(quote) => update({ quote })}
                rows={4}
                hint="Without surrounding quote marks — the page adds those."
              />
              <div className="ad-row ad-row-2">
                <Text
                  label="Author"
                  value={item.author}
                  onChange={(author) => update({ author })}
                  hint='Leave empty to show "Upwork client".'
                />
                <Text
                  label="Source"
                  value={item.source}
                  onChange={(source) => update({ source })}
                />
              </div>
              <div className="ad-row ad-row-2">
                <Text
                  label="Project"
                  value={item.context}
                  onChange={(context) => update({ context })}
                  hint="What the job was."
                />
                <Text label="Date" value={item.date} onChange={(date) => update({ date })} />
              </div>
            </>
          )}
        />
      </Card>

      <Card title="Work filter categories">
        <StringList
          label="Categories"
          value={ed.categories}
          onChange={(categories) => set({ categories })}
          addLabel="Add category"
          hint="The first one is the default filter. Each work item below must use one of these exactly, or it will not appear under any filter."
        />
      </Card>

      <Card title="Selected work">
        <Repeater
          items={ed.work}
          onChange={(work) => set({ work })}
          blank={() => ({
            id: `w${Date.now().toString(36)}`,
            title: "New piece",
            category: ed.categories[1] ?? ed.categories[0] ?? "",
            image: "",
            href: null,
          })}
          title={(item) => item.title}
          addLabel="Add work item"
          render={(item, update) => (
            <>
              <Text label="Title" value={item.title} onChange={(title) => update({ title })} />
              <Select
                label="Category"
                value={item.category}
                onChange={(category) => update({ category })}
                options={ed.categories.map((c) => ({ value: c, label: c }))}
              />
              <ImageField
                label="Thumbnail"
                value={item.image}
                onChange={(image) => update({ image })}
                folder="reel"
                basename={item.title}
              />
              <Text
                label="Link"
                value={item.href ?? ""}
                onChange={(href) => update({ href: href.trim() === "" ? null : href })}
                hint="A case study page or the ad itself. Leave empty for no link."
              />
            </>
          )}
        />
      </Card>
    </>
  );
}

/* ── Projects ───────────────────────────────────────────────────────────── */

export function ProjectsSection({
  value,
  onChange,
}: {
  value: Project[];
  onChange: (next: Project[]) => void;
}) {
  return (
    <Card title="Case studies">
      <p className="ad-hint">
        Each of these is a page at /projects/&lt;slug&gt; and a card on the home page.
        Changing a slug changes the URL — anything already linking to the old one
        will break.
      </p>
      <Repeater
        items={value}
        onChange={onChange}
        blank={() => ({
          slug: "new-project",
          index: `PROJ ${String(value.length + 1).padStart(2, "0")}`,
          timecode: "00:00:00:00",
          name: "New project",
          tagline: null,
          taglineIsBengali: false,
          cardLine: "",
          // `as const` or the literal widens to `string` before the generic
          // pins T, and the object stops matching Project.
          accent: "build" as const,
          meta: { role: "", type: "", stack: "" },
          problem: "",
          solution: "",
          solutionPoints: [],
          challenges: [],
          architecture: "",
          media: [],
          links: [],
        })}
        title={(item) => item.name}
        addLabel="Add project"
        render={(item, update) => (
          <>
            <div className="ad-row ad-row-2">
              <Text label="Name" value={item.name} onChange={(name) => update({ name })} />
              <Text
                label="Slug"
                value={item.slug}
                onChange={(slug) => update({ slug })}
                hint="Lowercase, hyphens only."
              />
            </div>
            <div className="ad-row ad-row-2">
              <Text label="Index" value={item.index} onChange={(index) => update({ index })} />
              <Text label="Timecode" value={item.timecode} onChange={(timecode) => update({ timecode })} />
            </div>
            <Select
              label="Accent"
              value={item.accent}
              onChange={(accent) => update({ accent })}
              options={ACCENTS}
              hint="Decides the colour the case study is themed in."
            />
            <Text
              label="Card line"
              value={item.cardLine}
              onChange={(cardLine) => update({ cardLine })}
              hint="The one line shown on the home page card."
            />
            <Text
              label="Tagline"
              value={item.tagline ?? ""}
              onChange={(tagline) => update({ tagline: tagline.trim() === "" ? null : tagline })}
              hint="Optional. Shown large on the case study page."
            />
            <Toggle
              label="Tagline contains Bengali"
              value={item.taglineIsBengali}
              onChange={(taglineIsBengali) => update({ taglineIsBengali })}
            />

            <div className="ad-row ad-row-2">
              <Text
                label="Role"
                value={item.meta.role}
                onChange={(role) => update({ meta: { ...item.meta, role } })}
              />
              <Text
                label="Type"
                value={item.meta.type}
                onChange={(type) => update({ meta: { ...item.meta, type } })}
              />
            </div>
            <Text
              label="Stack"
              value={item.meta.stack}
              onChange={(stack) => update({ meta: { ...item.meta, stack } })}
              hint="Separate with ·"
            />

            <Area label="Problem" value={item.problem} onChange={(problem) => update({ problem })} />
            <Area label="Solution" value={item.solution} onChange={(solution) => update({ solution })} />
            <StringList
              label="Solution points"
              value={item.solutionPoints}
              onChange={(solutionPoints) => update({ solutionPoints })}
              addLabel="Add point"
            />
            <StringList
              label="Challenges"
              value={item.challenges}
              onChange={(challenges) => update({ challenges })}
              addLabel="Add challenge"
              multiline
            />
            <Area
              label="Architecture"
              value={item.architecture}
              onChange={(architecture) => update({ architecture })}
            />

            <div className="ad-field">
              <span className="ad-label">Frames</span>
              <span className="ad-hint">
                Screenshots or stills. Upload replaces the placeholder images the
                site currently ships.
              </span>
              <Repeater
                items={item.media}
                onChange={(media) => update({ media })}
                blank={() => ({ src: "", alt: "", playhead: item.accent === "watch" })}
                title={(m, i) => m.alt || `Frame ${i + 1}`}
                addLabel="Add frame"
                render={(m, updateMedia, mediaIndex) => (
                  <>
                    <ImageField
                      label="Image"
                      value={m.src}
                      onChange={(src) => updateMedia({ src })}
                      folder="work"
                      basename={`${item.slug}-${mediaIndex + 1}`}
                    />
                    <Text
                      label="Alt text"
                      value={m.alt}
                      onChange={(alt) => updateMedia({ alt })}
                      hint="Describe what the image shows. Read aloud by screen readers."
                    />
                    <Toggle
                      label="Show the playhead overlay"
                      value={m.playhead}
                      onChange={(playhead) => updateMedia({ playhead })}
                    />
                  </>
                )}
              />
            </div>

            <div className="ad-field">
              <span className="ad-label">Links</span>
              <Repeater
                items={item.links}
                onChange={(links) => update({ links })}
                blank={() => ({ label: "Live site", href: "https://" })}
                title={(l) => l.label}
                addLabel="Add link"
                render={(l, updateLink) => (
                  <div className="ad-row ad-row-2">
                    <Text label="Label" value={l.label} onChange={(label) => updateLink({ label })} />
                    <Text label="URL" value={l.href} onChange={(href) => updateLink({ href })} />
                  </div>
                )}
              />
            </div>
          </>
        )}
      />
    </Card>
  );
}

/* ── Experience and services ────────────────────────────────────────────── */

export function ExperienceSection({
  value,
  onChange,
}: {
  value: ExperienceRow[];
  onChange: (next: ExperienceRow[]) => void;
}) {
  return (
    <Card title="Timeline">
      <p className="ad-hint">
        Rows marked <strong>build</strong> show on the software page, rows marked{" "}
        <strong>watch</strong> on the creative page. Both show on About.
      </p>
      <Repeater
        items={value}
        onChange={onChange}
        blank={() => ({
          period: "2026 — PRESENT",
          employment: "",
          accent: "build" as const,
          title: "New role",
          tags: [],
        })}
        title={(item) => item.title}
        addLabel="Add row"
        render={(item, update) => (
          <>
            <div className="ad-row ad-row-2">
              <Text label="Period" value={item.period} onChange={(period) => update({ period })} />
              <Select
                label="Side"
                value={item.accent}
                onChange={(accent) => update({ accent })}
                options={ACCENTS}
              />
            </div>
            <Text
              label="Employment"
              value={item.employment}
              onChange={(employment) => update({ employment })}
              hint='Full-time, Part-time, Freelance. Leave empty to hide it.'
            />
            <Text label="Title" value={item.title} onChange={(title) => update({ title })} />
            <StringList
              label="Tags"
              value={item.tags}
              onChange={(tags) => update({ tags })}
              addLabel="Add tag"
            />
          </>
        )}
      />
    </Card>
  );
}

export function ServicesSection({
  value,
  onChange,
}: {
  value: Service[];
  onChange: (next: Service[]) => void;
}) {
  return (
    <Card title="Services">
      <Repeater
        items={value}
        onChange={onChange}
        blank={() => ({ name: "New service", description: "" })}
        title={(item) => item.name}
        addLabel="Add service"
        render={(item, update) => (
          <>
            <Text label="Name" value={item.name} onChange={(name) => update({ name })} />
            <Area
              label="Description"
              value={item.description}
              onChange={(description) => update({ description })}
              rows={3}
            />
          </>
        )}
      />
    </Card>
  );
}

/* ── Contact ────────────────────────────────────────────────────────────── */

export function ContactSection({
  value,
  onChange,
}: {
  value: SiteData;
  onChange: Patch<SiteData>;
}) {
  const ct = value.contact;
  const set = (patch: Partial<typeof ct>) => onChange({ contact: { ...ct, ...patch } });

  return (
    <>
      <Card title="Closing section">
        <div className="ad-row ad-row-2">
          <Text label="Heading" value={ct.heading} onChange={(heading) => set({ heading })} />
          <Text label="Label" value={ct.label} onChange={(label) => set({ label })} />
        </div>
        <Text label="Timecode" value={ct.timecode} onChange={(timecode) => set({ timecode })} />
        <div className="ad-row ad-row-2">
          <Text
            label="Email shown"
            value={ct.email.label}
            onChange={(label) => set({ email: { ...ct.email, label } })}
          />
          <Text
            label="Email link"
            value={ct.email.href}
            onChange={(href) => set({ email: { ...ct.email, href } })}
            hint="Keep the mailto: prefix."
          />
        </div>
      </Card>

      <Card title="Social links">
        <Repeater
          items={ct.socials}
          onChange={(socials) => set({ socials })}
          blank={() => ({ label: "New link", href: "https://", external: true })}
          title={(item) => item.label}
          addLabel="Add link"
          render={(item, update) => (
            <>
              <div className="ad-row ad-row-2">
                <Text label="Label" value={item.label} onChange={(label) => update({ label })} />
                <Text label="URL" value={item.href} onChange={(href) => update({ href })} />
              </div>
              <Toggle
                label="Opens in a new tab"
                value={item.external}
                onChange={(external) => update({ external })}
              />
            </>
          )}
        />
      </Card>

      <Card title="Footer">
        <div className="ad-row ad-row-2">
          <Text label="Left" value={ct.footerLeft} onChange={(footerLeft) => set({ footerLeft })} />
          <Text label="Right" value={ct.footerRight} onChange={(footerRight) => set({ footerRight })} />
        </div>
      </Card>
    </>
  );
}
