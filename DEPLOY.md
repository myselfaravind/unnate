# UNNATE website

A static site: plain HTML, CSS and JavaScript, no framework and no build step. One small
server-side function delivers the enquiry form. Hosted on Cloudflare Pages from this repository.

## What's here

```
index.html                 homepage (7 sections: hero, philosophy, services, work, point of view, contact, footer)
                           The idea: “looking → feeling”. A pair of hand-drawn eyes looks, looks closer,
                           remembers and finally feels something. See the comment at the top of site.css.
work/index.html            the Work page: every project, filters, project viewer
assets/css/site.css        the whole design system and layout
assets/js/config.js        ← the values you edit: social links, email, form endpoint
assets/js/site.js          the eyes, navigation, enquiry form, selected-work stage
assets/js/work.js          Work page wall, category filters and viewer
assets/fonts/              self-hosted fonts (Epilogue for type, Nanum Pen Script for handwritten notes)
assets/img/                logo.svg (the orange character's files are kept here but the site no longer uses them)
assets/work/               optimised thumbnails, generated from portfolio/ by tools/build-media.mjs
portfolio/portfolio.js     ← the portfolio manifest: one entry per project
portfolio/websites|creatives|videos/   the original project files
functions/api/enquiry.js   the enquiry endpoint (Cloudflare Pages Function → Resend email)
tools/dev-server.mjs       local preview that also runs the enquiry function
tools/build-media.mjs      regenerates assets/work/ after portfolio changes
```

## Run it locally

Needs Node 18 or newer. Nothing to install.

```
node tools/dev-server.mjs                   # http://localhost:8788 — form shows its error state (no email settings)
MOCK_EMAIL=1 node tools/dev-server.mjs      # form succeeds; the email is printed in the terminal instead of sent
MOCK_EMAIL=fail node tools/dev-server.mjs   # the email provider "rejects" it, to see the failure state
RESEND_API_KEY=re_xxx ENQUIRY_TO=you@example.com node tools/dev-server.mjs   # sends a real email
```

## Before going live

1. **Enquiry email (required — the form cannot deliver until this is done).**
   - Create a free account at resend.com and an API key.
   - Cloudflare Pages → your project → Settings → Variables and Secrets, for Production (and Preview if wanted):
     - `RESEND_API_KEY` (as a *secret*) — the key
     - `ENQUIRY_TO` — the inbox that should receive enquiries
     - `ENQUIRY_FROM` (optional) — e.g. `UNNATE Website <enquiries@your-domain.com>`. Verify the domain in
       Resend first. Without it the function uses Resend's test sender, which only delivers to the email
       address that owns the Resend account.
   - Redeploy, send yourself a test enquiry from the live site, and confirm it arrives.
   - Prefer a form service? Put its full https endpoint in `enquiryEndpoint` in `assets/js/config.js`. It must
     accept a JSON POST and answer with JSON containing `"ok": true` (Formspree does).
2. **Domain** — replace `https://YOUR-DOMAIN.com/` in `index.html`, `work/index.html`, `robots.txt`, `sitemap.xml`.
3. **Links** — add your real Instagram, LinkedIn and email in `assets/js/config.js`. Empty values are not shown;
   until then the footer's Connect column offers "Send an enquiry".
4. **Privacy policy** — if you publish one, put its URL in `privacyUrl` in `assets/js/config.js`.
5. **Brand Identity work** — there is no brand-identity project in `portfolio/` yet, so that category is not shown
   as a filter. Add one with `group: 'Brand Identity'` and it appears automatically.
6. **Project labels** — in `portfolio/portfolio.js`, set `kind` (`'Client Work'`, `'Self-Initiated'`, `'Concept'`
   or `'Demo'`) on each project. Only two are labelled today, because only those could be confirmed from the
   files themselves.
7. **Website thumbnails** — run `node tools/build-media.mjs` once on a normal internet connection (see below).

## Updating the portfolio

1. Put the file in `portfolio/websites/<name>/`, `portfolio/creatives/` or `portfolio/videos/`.
2. Add an entry to `portfolio/portfolio.js` (the header comment explains each field). `featured: true` puts it
   on the homepage stage; `group` files it under a category.
3. Regenerate thumbnails: `npm i sharp playwright && node tools/build-media.mjs` (needs ffmpeg installed).
   Add `--no-web` to skip website screenshots.

Only add work that is real, and only label it with a `kind` that is true.

## The enquiry form

Required: name, work email, company or brand name, project message. Optional: website or social profile, services.
The success message is shown only when the server answers `"ok": true`. There is no calendar or call booking.

## Deploy

Commit and push. In Cloudflare Pages: no build command, output directory `/`. The `functions/` folder is picked
up automatically and served at `/api/enquiry`.
