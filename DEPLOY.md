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
assets/js/config.js        ← the values you edit: the two email addresses, social links, form endpoint
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
MOCK_EMAIL=1 node tools/dev-server.mjs      # forms succeed; the email (to two test inboxes) is printed instead of sent
MOCK_EMAIL=fail node tools/dev-server.mjs   # the email provider "rejects" it, to see the failure state
RESEND_API_KEY=re_xxx ENQUIRY_TO='a@unnate.com, b@unnate.com' node tools/dev-server.mjs   # sends a real email to both
node tools/check-site.mjs                   # static checks; exits non-zero if anything is broken
```

## Before going live

1. **Enquiry delivery to both inboxes (required — the forms cannot deliver until this is done).**
   Every valid enquiry, from any of the three forms, is emailed to **both** studio addresses in one message,
   with Reply-To set to the visitor, by `functions/api/enquiry.js` through Resend. The API key stays on the server.
   - Create an account at resend.com and an API key. Add and verify the `unnate.com` domain (Resend shows the DNS
     records to add) so mail can be sent from it.
   - Cloudflare Pages → your project → Settings → Variables and Secrets → Production:
     - `RESEND_API_KEY` — as a **secret**
     - `ENQUIRY_TO` — both addresses, separated by a comma: `first@unnate.com, second@unnate.com`
     - `ENQUIRY_FROM` — e.g. `UNNATE Website <enquiries@unnate.com>` (an address on the verified domain)
   - Redeploy. Then send one test enquiry from each form (home, `/clinical-websites/`, `/final-year-projects/`)
     and confirm **each test arrives in both inboxes**. The subject says which form it came from; the body ends
     with the form, the page and its title.
   - Until these are set, the forms say clearly that the enquiry was not sent (the server answers 503). Nothing
     is ever shown as sent unless Resend has accepted it.
   - A double tap or a retry cannot send the same enquiry twice: each filled-in form carries a submission id,
     and the function passes it (with a hash of the email) to Resend as an `Idempotency-Key`.
2. **Contact details** — put the studio's two customer-facing email addresses in `emails` in
   `assets/js/config.js`. Both then appear on every contact card ("Or email us directly") and in the footer.
   Use the same two addresses in `ENQUIRY_TO`. No phone number or WhatsApp is shown, by design.
3. **Privacy policy** — if you publish one, put its URL in `privacyUrl` in `assets/js/config.js`.
4. **Portfolio** — read the "Pending" section of `ASSETS.md`: the Modern Dental Studio Portrait creative and the
   Restaurant film are not in the repository yet. A ready-made data entry for the portrait is there.

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
