# UNNATE · portfolio asset manifest

What the site shows, where each file comes from, and what is still missing.
The data the site reads is `portfolio/portfolio.js`. Originals live in `portfolio/` on the studio
machine and are **not** committed (see `.gitignore`); the site only uses the optimised copies in `assets/`.

Labels: every short film and creative is **Client Work** (confirmed by the studio). The three websites are
labelled from their own HTML: Maren and Tick Pic Moments use placeholder phone numbers, addresses and emails
(`+1 (000) 000-0000`, `123 Wellness Avenue`, `wa.me/914400000000`), so both are **Demo**; Oddcart is a **Concept**.
No client names, testimonials or results are shown anywhere.

**Approved creatives: three only.** Dental care, Fresh Skin and Modern Dental Studio Portrait. No other creative
is shown. The four older creatives (SKIN in Progress, Dental Clinical creative, UNNATE Creatives, Beauty SPA)
were removed from the data, the homepage and `assets/work/`.

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
| `dental-care` | `portfolio/creatives/Dental care.png` | Home (rail, glass panel), `/clinical-websites/` rail, `/work/` |
| `fresh-skin` | `portfolio/creatives/Fresh Skin.png` | Home (rail, Content folder, glass panel), `/clinical-websites/` rail, `/work/` |
| `modern-dental-studio-portrait` | `portfolio/creatives/Modern Dental Studio Portrait.png` | **Pending — the file has not been supplied** (see below) |

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

These appear in the portfolio screenshots, but the files themselves are not in this repository, its history or
any of its branches, so they are **not** on the site. (Folder screenshots show their names and thumbnails, but a
thumbnail is not a usable image.)

| File | What happens when it arrives |
|---|---|
| `portfolio/creatives/Modern Dental Studio Portrait.png` (2.3 MB) | Add the entry below to `portfolio/portfolio.js`, then run `node tools/build-media.mjs --no-web`. It appears in the homepage rail, on `/work/` and, through its `healthcare` tag, on `/clinical-websites/`. |
| `portfolio/videos/Restaurant.mp4` (19.7 MB, 20 s) | Add an entry like the other films (`type: 'video'`, `kind: 'Client Work'`, `posterAt`, and the four `assets/work/…` paths), then run the same command. |

Ready-made entry for the portrait. Its thumbnail reads “Modern dentistry. At a human pace.”; check the title,
description and alt text against the real file before publishing:

```js
  { id: 'modern-dental-studio-portrait', src: 'portfolio/creatives/Modern Dental Studio Portrait.png', group: 'Content & Creative',
    title: 'Modern Dental Studio Portrait', category: 'Social creative', type: 'creative', kind: 'Client Work', featured: true, tags: ['healthcare'],
    desc: 'A portrait-led creative for a modern dental studio: “Modern dentistry. At a human pace.”',
    alt: 'A smiling woman in soft light beside the line “Modern dentistry. At a human pace.”',
    thumb: '/assets/work/modern-dental-studio-portrait.webp', full: '/assets/work/modern-dental-studio-portrait-full.webp' },
```

No brand-identity project exists yet, so there is no "Brand Identity" filter; one appears automatically when
a project with `group: 'Brand Identity'` is added.
