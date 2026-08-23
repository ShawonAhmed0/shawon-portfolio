# Content editor

Everything on the site — copy, projects, images, the showreel video, the
timeline, services, contact details — is edited from a panel at
**`/login`**, and published as a commit to this repository. Vercel redeploys
from that commit, so the live site updates about a minute after a save.

Nothing on the site links to it. The URL is the first thing you need to know
and the password is the second.

## One-time setup

### 1. A GitHub token so the panel can commit

Create a **fine-grained personal access token** at
<https://github.com/settings/personal-access-tokens/new>:

- **Repository access** → *Only select repositories* → `shawon-portfolio`
- **Permissions** → *Repository permissions* → **Contents: Read and write**

Nothing else. Contents is the only permission a save uses.

Set an expiry you are willing to renew — when it lapses, saving fails with a
GitHub `401 Bad credentials` and you issue a new token.

### 2. Environment variables in Vercel

Project → Settings → Environment Variables. Add these to **Production**
(and Preview, if you want the panel on preview deployments):

| Name | Required | What it is |
| --- | --- | --- |
| `ADMIN_PASSWORD` | yes | The password for `/login`. Make it long. |
| `GITHUB_TOKEN` | yes | The token from step 1. |
| `ADMIN_SECRET` | no | Extra key for signing the session cookie. Any long random string. |
| `GITHUB_REPO` | no | Defaults to `ShawonAhmed0/shawon-portfolio`. |
| `GITHUB_BRANCH` | no | Defaults to `main`. |

With no `ADMIN_PASSWORD` set, login always fails — the panel is closed rather
than open, which is the right way round for a missing secret.

### 3. Redeploy

Environment variables are read at build and request time, so the deployment
has to be redone once after adding them.

## Using it

Go to `https://shawonahmed.com/login`, enter the password, and you land on the
editor. A dot next to a section in the rail means it holds unsaved changes.
**Publish** writes everything in one commit — text and images together — so
the site is never deployed pointing at an image that has not been written yet.

Nothing is saved until you press Publish. Closing the tab with unsaved edits
loses them, and the browser will warn you.

### Images

Upload from any device. The browser resizes to 1600px on the long edge and
converts to WebP before anything is sent, so a 4MB phone photo arrives as
roughly 150KB. Each upload gets a content hash in its filename, so replacing
an image never leaves a browser or CDN serving the old one from cache.

One publish carries up to 3MB of images. Past that the Publish button explains
itself and you save in two passes.

### Video

The showreel takes a normal YouTube or Vimeo link — the one from the address
bar or the share button — and turns it into a player. Leave it empty and the
placeholder text shows instead.

Videos are not uploaded. A repository is the wrong place for video files, and
YouTube and Vimeo will stream them far better than this site could serve them.

## Working locally

With no `GITHUB_TOKEN` in the environment, the panel writes to the files in
`content/data/` and `public/` directly instead of committing. You then commit
and push as usual. This is what makes it usable offline and testable without
any secrets.

The local dev password comes from `.claude/launch.json` and is
`local-dev-only`. It has no bearing on production — Vercel never reads that
file. Change it there if you want.

## Where the content lives

`content/data/*.json` holds the values. `content/*.ts` are typed loaders over
them, so every page imports exactly what it did before. Adding a field means
editing the type in `content/site.ts`, the validator in `lib/admin/schema.ts`,
and the form in `components/admin/sections.tsx`.

Everything a save writes is validated first — field types, link schemes,
duplicate project slugs. A bad shape is rejected with the field path rather
than committed, because a malformed file would fail `next build` and leave the
live site frozen on its previous deploy.
