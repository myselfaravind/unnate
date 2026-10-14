# UNNATE website

A static site: plain HTML, CSS and JavaScript, no framework and no build step. One small server-side
function delivers the enquiry forms. Hosted on Cloudflare Pages from this repository.

## Pages

| URL | File | For |
|---|---|---|
| `/` | `index.html` | The studio: hero, process, belief, services, the two focused services, work, approach, contact |
| `/clinical-websites/` | `clinical-websites/index.html` | Clinic and healthcare owners. Shareable on its own. Shows the Maren demo. |
| `/final-year-projects/` | `final-year-projects/index.html` | Final-year students. No prices anywhere, by design. |
| `/work/` | `work/index.html` | Every project, with filters and the project viewer. `/work/#<id>` opens one project. |
| `/demos/<id>/` | `demos/*/index.html` | The working website demos (noindex) |
| 404 | `404.html` | Served by Cloudflare Pages for any unknown address |

Cloudflare Pages serves `folder/index.html` at `/folder/` and redirects `/folder` to `/folder/`, so direct
visits, refreshes and back/forward all work. All internal links and asset paths are root-absolute (`/assets/…`).
`_redirects` sends a few likely misspellings (`/clinics`, `/clinic-websites`, `/final-year-project`) to the right page.

## What's where

```
assets/css/site.css        the whole design system: tokens, components, every page's layout
assets/js/config.js        ← the values you edit: email, phone, WhatsApp, social links, form endpoint
assets/js/site.js          shared: navigation, reveals, the character, enquiry forms, tabs, timeline
assets/js/home.js          homepage only: hero capsules and eyes, process card, drawer, verdict
assets/js/work.js          project rails, filters, hover previews and the viewer (home, /work/, landing pages)
assets/img/icons.svg       the wordmark and every icon
assets/img/mascot, eyes    the character's poses and expressions
assets/work/               optimised portfolio media (cards, full images, posters, films, website screenshots)
portfolio/portfolio.js     ← the portfolio data: one entry per project
functions/api/enquiry.js   the enquiry endpoint (Cloudflare Pages Function → Resend email)
_headers, _redirects       Cloudflare Pages headers and redirects
tools/dev-server.mjs       local preview that also runs the enquiry function
tools/check-site.mjs       static checks: broken links, unused assets, headings, prices, canonicals
tools/build-media.mjs      regenerates assets/work/ from the originals in portfolio/
tools/build-og.mjs         regenerates the social preview images
ASSETS.md                  every portfolio file, where it came from, and what is still missing
```

The header and footer are written into each page (there is no template step). If you change a link in
one, change it in all five HTML files.

## Run it locally

Needs Node 18 or newer. Nothing to install.

```
node tools/dev-server.mjs                   # http://localhost:8788 — forms show their error state (no email settings)
MOCK_EMAIL=1 node tools/dev-server.mjs      # forms succeed; the email is printed in the terminal instead of sent
MOCK_EMAIL=fail node tools/dev-server.mjs   # the email provider "rejects" it, to see the failure state
RESEND_API_KEY=re_xxx ENQUIRY_TO=you@example.com node tools/dev-server.mjs   # sends a real email
node tools/check-site.mjs                   # static checks; exits non-zero if anything is broken
```

## Before going live

1. **Enquiry email (required — the forms cannot deliver until this is done).**
   - Create an account at resend.com and an API key. Verify the `unnate.com` domain in Resend.
   - Cloudflare Pages → your project → Settings → Variables and Secrets, for Production:
     - `RESEND_API_KEY` (as a *secret*)
     - `ENQUIRY_TO` — the inbox that should receive enquiries
     - `ENQUIRY_FROM` — e.g. `UNNATE Website <enquiries@unnate.com>`
   - Redeploy, then send a test enquiry from each of the three forms (home, clinic, student) and confirm
     all three arrive. The subject line says which form it came from.
   - Prefer a form service? Put its full https endpoint in `enquiryEndpoint` in `assets/js/config.js`. It must
     accept a JSON POST and answer with JSON containing `"ok": true`.
2. **Contact details** — add your real email, phone, WhatsApp, Instagram and LinkedIn in `assets/js/config.js`.
   Empty values are simply not shown. Once filled in they appear on every contact card and in the footer.
   Clinic owners and students in particular will look for a phone or WhatsApp number.
3. **Privacy policy** — if you publish one, put its URL in `privacyUrl` in `assets/js/config.js`.
4. **Portfolio** — read the "Pending" section of `ASSETS.md`: two files from your portfolio folder are not in
   the repository yet, and four creatives on the site are no longer in your local folder.
5. **Project labels** — in `portfolio/portfolio.js`, set `kind: 'Client Work'` on anything that was a paid
   client project. Only add labels that are true.

## Updating the portfolio

1. Put the original in `portfolio/websites/<name>/`, `portfolio/creatives/` or `portfolio/videos/`
   (these folders are ignored by git; only the optimised copies are deployed).
2. Add an entry to `portfolio/portfolio.js` (the header comment explains each field). `featured: true` puts it
   on the homepage rail; `tags: ['healthcare']` adds it to the clinic page's rail.
3. Regenerate media: `npm i sharp playwright && node tools/build-media.mjs` (needs ffmpeg).
   Add `--no-web` to skip website screenshots.
4. Run `node tools/check-site.mjs`.

## The enquiry forms

| Form | Kind | Required |
|---|---|---|
| Homepage | `general` | name, work email, company or brand, message |
| `/clinical-websites/` | `clinic` | name, email, clinic or practice name, message |
| `/final-year-projects/` | `student` | name, email, message |

Everything else is optional. Validation runs in the browser and again in `functions/api/enquiry.js`. A success
message appears only when the server answers `"ok": true`, which it does only after Resend accepts the email.
A hidden honeypot field filters simple spam bots.

## Deploy

Commit and push. In Cloudflare Pages: no build command, output directory `/`. The `functions/` folder is
picked up automatically and served at `/api/enquiry`; `_headers` and `_redirects` are applied automatically.
