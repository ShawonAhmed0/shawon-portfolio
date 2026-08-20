# Asset generation prompts — 24 images

Every prompt below is the **subject line only**. Append the shared STYLE block
and pass the shared NEGATIVE block. That is what keeps 25 separately-generated
images looking like one coherent site instead of 25 unrelated stock photos.

---

> **Rewritten for the light system.** These previously specified deep matte
> blacks and a teal-and-orange cinematic grade, which suited the old near-black
> site. The site is now warm paper (`#FAF7F2`), so dark plates would sit on it
> as heavy rectangles.

## SHARED STYLE (append to every prompt)

```
Bright airy photograph, soft diffused daylight, warm neutral colour grade,
pale creamy background, gentle shadows, high-key lighting, shallow depth of
field, 50mm lens, fine natural grain, generous empty space around the subject.
Clean and minimal. Photographic, not illustrated.
```

## SHARED NEGATIVE (pass to every prompt)

```
text, letters, words, logos, watermark, signature, UI, interface, screenshot,
dark background, black background, moody, low-key, heavy shadows, neon,
oversaturated, cartoon, illustration, 3d render, cluttered, busy background,
harsh contrast, blown highlights
```

## Palette anchors

| Role | Hex | Where it must appear |
|---|---|---|
| Paper | `#FAF7F2` | Backgrounds, negative space |
| Warm accent | `#E07A24` | Props, highlights, warmth |
| Cool accent | `#2F5BD7` | Occasional contrast |

**Every image must read light.** If a result comes back dark or moody, discard
it — one dark plate in a grid of pale ones breaks the whole page.

---

# 1. HERO — no longer needed

The hero backdrop is now a **canvas-rendered gradient bloom**, not an image
file. There is nothing to generate. Skip to the reel frames.

# 2–13. REEL FRAMES — `public/reel/frame-01.jpg` … `frame-12.jpg`
**1520×856 (16:9)** each

These read as graded frames from your performance-ad reel. Vary the subject,
keep the grade identical.

| # | File | Prompt |
|---|---|---|
| 02 | `frame-01` | Unbranded glass serum bottle on a pale linen surface, soft window light, delicate shadow, cream background |
| 03 | `frame-02` | Over-the-shoulder UGC moment, a person holding a product toward a bright window, airy and overexposed highlights |
| 04 | `frame-03` | Extreme macro of cream texture swirled on a white surface, soft even light, pastel tones |
| 05 | `frame-04` | Hands opening a plain kraft package on a pale wooden table, bright morning light |
| 06 | `frame-05` | Unbranded jar on a pale plaster surface, soft directional daylight, long gentle shadow |
| 07 | `frame-06` | Abstract soft-focus wash of warm peach and cream light, no subject, dreamy and bright |
| 08 | `frame-07` | Botanical macro — cut citrus and a green leaf on white marble, bright diffused light |
| 09 | `frame-08` | Close detail of hands peeling a seal from pale packaging, soft daylight, minimal |
| 10 | `frame-09` | A smartphone held in a bright airy room, screen content abstract and unreadable, pale background |
| 11 | `frame-10` | Studio product shot on a seamless cream backdrop, soft box light, gentle falloff |
| 12 | `frame-11` | Surreal bright commercial visual: a product-like form dissolving into pale drifting particles on cream |
| 13 | `frame-12` | Overhead flat-lay of unbranded cosmetics on pale stone, soft even light, airy negative space |

---

# 14–25. WORK IMAGES

## ⚠️ Read this first

**HishabAI, Aid For Men Foundation and Movie Discovery are real products you
built.** Generating fake UI for them would misrepresent your actual work to
anyone evaluating you — and AI-generated interfaces look obviously fake to
engineers, which is the audience for those cards.

**Use real screenshots for these 9.** A plain screenshot of software you
genuinely shipped beats any generated image on a portfolio.

The prompts below are a fallback only, and they deliberately produce
**contextual/atmospheric imagery, never fake interfaces.**

Relaxe (20–22) is the exception — AI creative is literally what you delivered
on that project, so generated frames are honest there.

### HishabAI — bookkeeping platform for small businesses

| # | File | Size | Prompt |
|---|---|---|---|
| 14 | `hishabai-1` | 800×520 | A laptop on a bright, tidy desk beside paper ledgers and a calculator, soft daylight from a window, screen content not visible, pale walls |
| 15 | `hishabai-2` | 800×640 | Close macro of handwritten ledger pages and a pen on a light wooden counter, bright diffused daylight |
| 16 | `hishabai-3` | 1000×1200 | Vertical shot of a small tidy shop counter in daylight, pale shelves, bright and calm, no people |

### Aid For Men Foundation — nonprofit content platform

| # | File | Size | Prompt |
|---|---|---|---|
| 17 | `aid-for-men-1` | 800×520 | Bright empty community meeting room, neatly stacked chairs, large windows, soft daylight, pale walls |
| 18 | `aid-for-men-2` | 800×640 | Close detail of hands resting on a pale table in conversation, faces out of frame, bright soft daylight |
| 19 | `aid-for-men-3` | 1000×1200 | Vertical shot of a bright airy corridor, pale walls, daylight throughout, no people |

### Relaxe — UGC / Meta ad creative *(AI-generated is honest here)*

| # | File | Size | Prompt |
|---|---|---|---|
| 20 | `relaxe-performance-ads-1` | 800×520 | Unbranded relaxation product on a pale stone surface with soft steam, bright spa-like calm, cream tones |
| 21 | `relaxe-performance-ads-2` | 800×640 | UGC-style handheld frame: hands presenting a plain product to camera in a bright living room, natural imperfect framing |
| 22 | `relaxe-performance-ads-3` | 1000×1200 | Vertical 9:16-feel ad frame, product held up against a bright cream background, punchy and clean |

### Movie Discovery — TMDB app

| # | File | Size | Prompt |
|---|---|---|---|
| 23 | `movie-discovery-1` | 800×520 | Bright modern cinema lobby, pale seating, large windows, daylight, no people |
| 24 | `movie-discovery-2` | 800×640 | Macro of a 35mm film strip coiled on a pale surface, soft bright light picking out the sprocket holes |
| 25 | `movie-discovery-3` | 1000×1200 | Vertical shot of a vintage projector on a pale table by a sunlit window, soft warm daylight |

---

## After generating

1. Save each to its exact path above — filenames are already wired in code.
2. Convert to JPEG and resize:
   ```bash
   sips -s format jpeg -s formatOptions 84 -z HEIGHT WIDTH input.png --out public/reel/frame-01.jpg
   ```
3. Keep every file under ~250 KB. 25 oversized images will wreck load time.
4. Reel tiles render at 380×214 — check them at that size, not full resolution.
