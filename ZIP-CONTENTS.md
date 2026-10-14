# unnate-deployment-ready.zip

The complete UNNATE website, ready to extract into the root of your repository (`D:\Projects\unnate`), commit,
push and deploy. **Read `DEPLOY.md` first**: section 1 shows how to extract it safely, and section 5 covers the
one manual step that remains, FormSubmit activation.

Built from commit `74a31ae` on branch `claude/eloquent-darwin-nz5ax1`, plus a rewritten `DEPLOY.md` and this file.
No build step, no `package.json`, no dependencies, no secrets, no environment variables.

## Important files

| Path | What it is |
|---|---|
| `index.html` | Homepage `/` |
| `clinical-websites/index.html` | `/clinical-websites/`, for clinics and healthcare practices |
| `final-year-projects/index.html` | `/final-year-projects/`, for final-year students (no prices anywhere) |
| `work/index.html` | `/work/`, all projects with filters and the project viewer |
| `404.html` | The not-found page |
| `assets/js/config.js` | **The two enquiry addresses**: `aravind@unnate.com` (To) and `saran@unnate.com` (CC). `formsubmitAlias` is empty on purpose. |
| `assets/js/site.js` | Navigation, reveals and the three enquiry forms, which post to FormSubmit's AJAX endpoint |
| `assets/js/home.js`, `assets/js/work.js` | Homepage interactions; project rails, filters, video previews and viewer |
| `assets/css/site.css` | The whole design system and every page's layout |
| `assets/fonts/`, `assets/img/`, `assets/work/` | Fonts, icons, mascot, social images, and the optimised portfolio media (films included) |
| `portfolio/portfolio.js` | The portfolio data |
| `demos/` | The three working website demos (Maren Dental Studio, Oddcart, Tick Pic Moments) |
| `_headers`, `_redirects` | Cloudflare Pages headers and redirects |
| `robots.txt`, `sitemap.xml`, `site.webmanifest`, favicons | Search and browser files |
| `tools/` | Local preview server and checks (`check-site.mjs`, `test-browser.mjs`), media and image generators |
| `DEPLOY.md` | Step-by-step: extract, check, commit, push, Cloudflare Pages, FormSubmit activation, tests, troubleshooting |
| `ASSETS.md` | Every portfolio file, where it came from, and what is still missing |
| `.gitignore` | Keeps your original portfolio files and `node_modules` out of git |

Not included: `.git`, `node_modules`, your original portfolio files in `portfolio/creatives/`, `portfolio/videos/`
and `portfolio/websites/` (the site uses the optimised copies in `assets/work/`), and any secrets.

## Removed compared with your current `main`

The previous design's `assets/fonts/epilogue.woff2`, `fraunces.woff2` and `fraunces-italic.woff2`,
`assets/hairline/`, `assets/img/logo.svg`, `assets/work/oddcart-wide.webp`, and the retired creatives
(SKIN in Progress, Dental Clinical creative, UNNATE Creatives, Beauty SPA). Extracting the ZIP over your
repository will not delete these on its own; `DEPLOY.md` section 1 does it with `git rm`.

## Manual steps that remain

1. **Activate FormSubmit.** After deploying, send one enquiry from https://unnate.com/. FormSubmit emails
   **aravind@unnate.com** an "Activate Form" link; click it. If **saran@unnate.com** receives a confirmation
   email, click that too. Until then no enquiry is delivered, and the forms correctly show an error.
2. **Test all three forms** on the live site and confirm each enquiry reaches **both** inboxes (`DEPLOY.md` section 6).
3. If `RESEND_API_KEY`, `ENQUIRY_TO` or `ENQUIRY_FROM` exist in your Cloudflare Pages settings, delete them;
   nothing uses them.
4. Still missing: `Modern Dental Studio Portrait.png` (see `ASSETS.md`).

Delivery to the two inboxes has **not** been tested yet: the build environment could not reach formsubmit.co,
and activation can only be done by the address owners.
