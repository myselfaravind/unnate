# UNNATE · portfolio asset manifest

What the site shows, where each file comes from, and what is still missing.
The data the site reads is `portfolio/portfolio.js`. Originals live in `portfolio/` on the studio
machine and are **not** committed (see `.gitignore`); the site only uses the optimised copies in `assets/`.

Labels: a project carries `kind: 'Demo'`, `'Concept'` or `'Self-Initiated'` only where the files prove it.
The three websites are labelled from their own HTML: Maren and Tick Pic Moments use placeholder phone
numbers, addresses and emails (`+1 (000) 000-0000`, `123 Wellness Avenue`, `wa.me/914400000000`), so both
are **Demo**; Oddcart was already labelled **Concept**. Nothing else is labelled, because nothing in the
files says whether it was client work. If any creative or film *was* client work, add `kind: 'Client Work'`.

## In use

### Websites — hosted demos and screenshots

| Project | Working build (served by the site) | Original | Screenshots (`assets/work/sites/`) | Shown on |
|---|---|---|---|---|
| Maren Dental Studio | `/demos/maren-dental-studio/` | `portfolio/websites/Maren Dental Studio/index.html` | `maren-0/1/2.webp`, `maren-m.webp`, `maren-card.webp` | Home rail + Web folder + focus card, `/clinical-websites/` (hero, showcase, rail), `/final-year-projects/` rail, `/work/` |
| Oddcart | `/demos/oddcart/` | `portfolio/websites/Oddcard/index.html` | `oddcart-0/1/2.webp`, `oddcart-m.webp`, `oddcart-card.webp` | Home rail, `/final-year-projects/` rail, `/work/` |
| Tick Pic Moments | `/demos/tickpic-moments/` | `portfolio/websites/TickPic Moments/index.html` | `tickpic-0/1/2.webp`, `tickpic-m.webp`, `tickpic-card.webp` | Home rail + Web folder, `/final-year-projects/` rail, `/work/` |

The demos were restored from git history (commit `ae92e9b`) into `demos/<id>/index.html`. Each is a single
self-contained HTML file; they load fonts from Google Fonts and photos from Unsplash (Maren) or inline
data (Tick Pic), so they need an internet connection to look right. `_headers` marks `/demos/*` as
`noindex` and `robots.txt` disallows it, so placeholder content never shows up in search results.
They are opened in a new tab rather than embedded, so they never share the main site's page.

The screenshots and the website case notes were taken from the prototype (`unnate-prototype-v4.html`),
where they were rendered from these same files.

### Creatives — `assets/work/<id>.webp` (4:5 card) and `<id>-full.webp` (viewer)

| id | Original | Shown on |
|---|---|---|
| `skin-in-progress` | `portfolio/creatives/SKIN in Progress.png` | Home (rail, Content folder, verdict), `/clinical-websites/` rail, `/work/` |
| `dental-clinical-creative` | `portfolio/creatives/Dental Clinical creative.png` | Home (rail, Paid folder), `/clinical-websites/` rail, `/work/` |
| `unnate-creatives` | `portfolio/creatives/Unnate Creative's.png` | Home (rail, verdict), `/work/` |
| `dental-care` | `portfolio/creatives/Dental care.png` | Home rail, `/clinical-websites/` rail, `/work/` |
| `beauty-spa` | `portfolio/creatives/Beauty SPA.png` | `/clinical-websites/` rail, `/work/` |
| `fresh-skin` | `portfolio/creatives/Fresh Skin.png` | Home verdict, `/work/` |

### Short-form films — `assets/work/video/`

Re-encoded from the originals in git history (commit `3fe1dea`): H.264, 720×1280, CRF 25, AAC 96 kb/s,
`+faststart`. Each film also has a 5-second, 360×640, silent `-preview.mp4` used for hover previews.
The full film loads only when someone opens it; a preview loads only when a mouse rests on its card.

| id | Original | Web film | Preview | Poster / card |
|---|---|---|---|---|
| `solara-drinks` | `SOLARA Drink's.mp4` (9.4 MB) | 2.8 MB | 200 KB | `solara-drinks-poster.webp`, `solara-drinks.webp` |
| `crave-burgers-ad` | `Crave Burger's AD.mp4` (12.5 MB) | 3.4 MB | 175 KB | `crave-burgers-ad-poster.webp`, `crave-burgers-ad.webp` |
| `pearl-medspa` | `Pearl MedSpa.mp4` (9.0 MB) | 1.8 MB | 98 KB | `pearl-medspa-poster.webp`, `pearl-medspa.webp` |
| `neuva-diwali` | `NEUVA Biwali.mp4` (17.8 MB) | 2.4 MB | 149 KB | `neuva-diwali-poster.webp`, `neuva-diwali.webp` |
| `crave-burgers` | `Crave Burger's.mp4` (19.5 MB) | 2.9 MB | 140 KB | `crave-burgers-poster.webp`, `crave-burgers.webp` |
| `neuva` | `NEUVA.mp4` (20.2 MB) | 2.8 MB | 169 KB | `neuva-poster.webp`, `neuva.webp` |

### Brand

| File | Source |
|---|---|
| `assets/fonts/mona-sans.woff2`, `gochi-hand.woff2` | Extracted from the prototype (SIL Open Font License, see `assets/fonts/LICENSE.txt`) |
| `assets/img/mascot/*.webp` | The character's action sheet (stand, step, hop, stride, walk-a, walk-b, crouch, leap) and four stage poses, extracted from the prototype. The poses were resized to 880 px wide. |
| `assets/img/eyes/*.webp` | The four "feel" expressions, extracted from the prototype |
| `assets/img/icons.svg` | The UNNATE wordmark and UI icons |
| `assets/img/og/*.jpg` | Social preview cards, rendered by `tools/build-og.mjs` from `tools/og.html` |
| `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192/512.png` | Restored from git history (the orange eyes icon) |

## Pending — files I could not use

These appear in the portfolio screenshots you supplied, but the files themselves are not in this repository
or its history, so they are **not** on the site:

| File (from your screenshots) | What's needed |
|---|---|
| `portfolio/videos/Restaurant.mp4` (19.7 MB, 20 s) | Copy it into `portfolio/videos/`, add an entry to `portfolio/portfolio.js` (id, title, group, category, one honest line, `src`, `posterAt`, and the four `assets/work/…` paths), then run `node tools/build-media.mjs --no-web`. |
| `portfolio/creatives/Modern Dental Studio Portrait.png` (2.3 MB) | The thumbnail reads “Modern dentistry. At a human pace.”, Maren's line, so it looks like a Maren creative. Add it the same way, with `tags: ['healthcare']`, and it will also appear on `/clinical-websites/`. |

**Please confirm:** your current `portfolio/creatives/` folder only holds *Dental care*, *Fresh Skin* and
*Modern Dental Studio Portrait*. The site still shows four creatives that are no longer in that folder:
*SKIN in Progress*, *Dental Clinical creative*, *UNNATE Creatives* and *Beauty SPA*. Their optimised
copies are in the repository and the prototype used them, so I kept them. If you removed them on purpose,
delete their entries from `portfolio/portfolio.js` (and the matching `<figure>`/`<img>` lines in
`index.html`'s folders and verdict).

No brand-identity project exists yet, so there is no "Brand Identity" filter; one appears automatically when
a project with `group: 'Brand Identity'` is added.
