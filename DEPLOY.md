# UNNATE website — deploy & update guide

A static site (HTML/CSS/JS + files). No backend, no build step. Works the same locally, on GitHub and on Cloudflare.

## Folder
```
index.html              the website
assets/img/             site images
portfolio/portfolio.js  ← the portfolio manifest (Section 03 reads this)
portfolio/websites/     your website projects, one folder each
portfolio/creatives/    creative images
portfolio/videos/       short-form videos (+ poster images)
favicon.ico, favicon-32x32.png, apple-touch-icon.png, icon-192.png, icon-512.png, site.webmanifest
og-image.jpg, robots.txt, sitemap.xml
```

## Adding your real portfolio (do this first)
1. Copy each website project into `portfolio/websites/<name>/` (its `index.html` plus its own css/js/images/fonts, using
   *relative* links). Creatives go in `portfolio/creatives/`, videos (+ a .jpg poster each) in `portfolio/videos/`.
2. Open `portfolio/portfolio.js` and add one line per piece — the commented examples show the exact format.
   Mark the pieces you want in **All works** with `featured: true`, and keep `tag` honest (`'Client work'`, `'Concept'` …).
3. Delete the built-in `demo:` lines that your real work replaces. (Keep `diwali` and `summer` if you want them.)
Full details: `portfolio/README.md`.

Websites appear as live previews (desktop view in the gallery; the site's own mobile layout on phones) and open fully
interactive. Videos only download when someone hovers (mouse) or opens them (touch). Images keep their own proportions.

## Before going live — values only you can provide
1. **Domain** — replace `https://YOUR-DOMAIN.com/` in `index.html`, `robots.txt`, `sitemap.xml`.
2. **Enquiries** — set `FORM_ENDPOINT` (or `CONTACT_EMAIL`) in `index.html`; until then the form can't deliver.
3. **Company details** (optional) — `const COMPANY = { … }` in `index.html`; add only verified details.

## Deploy (GitHub → Cloudflare)
Commit the folder's contents to the repository root and push. In Cloudflare Pages: no build command, output directory `/`.
Turn on HTTPS and choose www or non-www. Nothing else is required.

## Google (needs your account — not done by the code)
Search Console: add the domain, verify via DNS, submit `sitemap.xml`, request indexing of the homepage.
Business Profile: only if UNNATE has a real location or service area — create and verify it at business.google.com.
