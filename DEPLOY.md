# UNNATE website — deployment guide

A static site: plain HTML, CSS and JavaScript. **There is no build step, no `package.json`, no dependencies to
install and no server code.** Enquiry forms are delivered by FormSubmit (free, no account, no API key, no
environment variables). Hosted on Cloudflare Pages.

Contents: 1 Update your repository · 2 Check it locally · 3 Commit and push · 4 How Cloudflare Pages deploys it ·
5 Activate FormSubmit · 6 Test the three forms · 7 Troubleshooting · then reference: pages, files, forms, portfolio.

## 1. Update your local repository

Your GitHub `main` is at commit `ab88e52 update`. This version replaces it. Choose **one** of the two ways.
Both keep your original portfolio files (`portfolio/creatives/`, `portfolio/videos/`, `portfolio/websites/`),
which git does not track.

First, in both cases, make a safety copy of where you are now:

```
cd D:\Projects\unnate
git status                      # commit or stash anything of your own first
git checkout main
git pull
git branch backup-before-redesign
```

### A. Merge the branch that already holds these changes (simplest)

The site in the ZIP is also on GitHub, on the branch `claude/eloquent-darwin-nz5ax1`. Only this `DEPLOY.md`
and `ZIP-CONTENTS.md` are newer in the ZIP, so after merging, copy those two files from the ZIP over the merged ones.

```
git fetch origin
git merge origin/claude/eloquent-darwin-nz5ax1
```

The merge is a fast-forward (no conflicts), because the branch starts from your current `main`.

### B. Use the ZIP

The ZIP contains the whole site at its top level (no extra folder). Some old files no longer exist in this
version (the previous design's fonts, `assets/hairline/`, `assets/img/logo.svg` and four retired creatives), so
remove the tracked files first, then extract. `git rm` removes only files git tracks; your untracked portfolio
originals and `.git` stay.

PowerShell:

```
cd D:\Projects\unnate
git rm -r -q .
Expand-Archive -Path "$HOME\Downloads\unnate-deployment-ready.zip" -DestinationPath . -Force
git add -A
git status
```

Git Bash (macOS or Linux are the same):

```
cd /d/Projects/unnate
git rm -r -q .
unzip -o ~/Downloads/unnate-deployment-ready.zip -d .
git add -A
git status
```

`git status` should show the new pages, assets and tools added, the files listed above deleted, and **no**
files from `portfolio/creatives/`, `portfolio/videos/` or `portfolio/websites/` (the new `.gitignore` keeps them
out). Your old `portfolio/README.md`, if you still have it, may appear as a new file; keep or delete it as you
like. If something looks wrong, `git checkout backup-before-redesign` takes you back.

## 2. Check it locally

You need Node.js 18 or newer (`node -v`). Nothing else to install.

```
node tools/check-site.mjs        # must end with "All checks passed."
node tools/dev-server.mjs        # then open http://localhost:8788
```

`check-site` looks for broken links and asset paths, missing titles, descriptions and canonical URLs, duplicate
ids, more than one `<h1>`, and any price on any page. With the preview running, click through `/`,
`/clinical-websites/`, `/final-year-projects/` and `/work/`, and try a phone-sized window.

Optional, deeper browser checks (every page at 8 widths, forms, viewer, menu, reduced motion). They need
Playwright once, and they intercept FormSubmit, so they never send an email:

```
npm install --no-save playwright
npx playwright install chromium
node tools/test-browser.mjs      # with the dev server still running; must end "All browser checks passed."
```

Do not test real delivery from localhost; do that on the published site (section 5).

## 3. Commit and push

```
git add -A
git commit -m "Redesign: three-page site, FormSubmit enquiries to both inboxes"
git push origin main
```

(With option A the merge already made the commit; just `git push origin main`.)

## 4. How Cloudflare Pages deploys this repository

- In the Cloudflare dashboard → Workers & Pages → your project → Settings → Builds:
  **Framework preset: None. Build command: (empty). Build output directory: `/`.**
- If the project is connected to the GitHub repository, every push to the **production branch** (usually `main`;
  shown under Settings → Builds → Branch control) publishes to https://unnate.com/ within a minute or two.
  Pushes to other branches get their own preview address.
- If the project was set up with **Direct Upload** instead, upload the extracted folder in the dashboard
  (Deployments → Create deployment). Do not upload the `.git` folder or `node_modules`.
- `_headers` (security headers, caching, `noindex` on `/demos/`) and `_redirects` (a few misspelled addresses)
  are applied automatically.
- **No environment variables are needed.** If `RESEND_API_KEY`, `ENQUIRY_TO` or `ENQUIRY_FROM` were ever added
  under Settings → Variables and Secrets, nothing uses them any more; you can delete those three.
- After deploying, open https://unnate.com/, https://unnate.com/clinical-websites/ and
  https://unnate.com/final-year-projects/, and refresh each one to confirm direct visits work.

## 5. Activate FormSubmit (required — nothing is delivered until this is done)

How delivery works: each form sends the enquiry from the visitor's browser to FormSubmit's AJAX endpoint
`https://formsubmit.co/ajax/aravind@unnate.com`, and FormSubmit's documented `_cc` field copies it to
`saran@unnate.com`. Both addresses come from `emails` in `assets/js/config.js`; the first receives, the
second is copied in. Visitors stay on the page.

**Neither address has been activated yet.** FormSubmit only delivers to an address after its owner confirms it.

1. Once the site is live, open **https://unnate.com/** (the real domain, not localhost or a preview address)
   and send one enquiry from the homepage form, using your own name and email.
2. The form will say **“Your enquiry wasn’t sent”**. That is expected: FormSubmit has answered that the form
   needs activation, and the site never claims success unless FormSubmit accepted the enquiry.
3. In **aravind@unnate.com**, open the email from FormSubmit (subject similar to “Action Required: Activate
   FormSubmit on …”). Check spam or junk, and the Promotions tab in Gmail. Click **Activate Form**.
4. Check **saran@unnate.com** too. If FormSubmit sent it a confirmation email, click its link. Without it,
   copies may not arrive there.
5. If no activation email arrives within 15 minutes, send another enquiry from the site and check again.

Activation is a one-time step per address. If you ever change the addresses in `config.js`, the new first
address must be activated the same way.

## 6. Test the three forms and confirm both inboxes

Do each test from the live site, after activation, with a different name so you can tell them apart:

| # | Page | Fill in | Expected subject |
|---|---|---|---|
| 1 | https://unnate.com/#contact | name, work email, company, message | Studio enquiry — *name* (*company*) |
| 2 | https://unnate.com/clinical-websites/#contact | name, email, clinic name, message; tick “Dental” | Clinic website enquiry — *name* (*clinic*) |
| 3 | https://unnate.com/final-year-projects/#contact | name, email, message; tick “Explanation guide” | Final-year project enquiry — *name* |

For every test, check:

1. The page shows its thank-you message without reloading.
2. The email arrives in **aravind@unnate.com** and **saran@unnate.com** (one To, one CC).
3. The subject matches the table, the email lists the answers and ticked options, and its last row is the page.
4. Pressing **Reply** addresses the reply to the visitor's email, not to FormSubmit.
5. Leaving a required field empty shows a message under that field and sends nothing.

Delivery is confirmed only when all three tests reach both inboxes.

7. Optional: FormSubmit's activation email (or a later one) includes a random string that can stand in for
   `aravind@unnate.com` in the form address. Paste it into `formsubmitAlias` in `assets/js/config.js`, push,
   and repeat one test. Leave it empty if you don't have one; the site then uses the first address.

## 7. Troubleshooting

| Symptom | Likely cause and what to do |
|---|---|
| Every form says “Your enquiry wasn’t sent. The server didn’t accept it…” | Not activated yet (section 5). In the browser, open Developer Tools → Console: the site logs FormSubmit's own message, e.g. “This form needs Activation…”. |
| “We couldn’t reach the server” | The visitor's network, an ad or privacy blocker, or a company firewall blocked `formsubmit.co`. Try another browser or network. The message offers both email addresses so the visitor can still write directly. |
| No activation email | Check spam and junk; send another enquiry from https://unnate.com/; make sure `emails` in `config.js` is spelled exactly right. |
| Thank-you message shown, but nothing in either inbox | Look in spam and junk and mark FormSubmit as “not spam”. Wait a few minutes; FormSubmit can be slow. If it persists, send a test with a plain message (no links). |
| aravind@ receives it, saran@ does not | Look for a FormSubmit confirmation email in saran@ (section 5, step 4) and in its spam folder. Check the second address in `config.js`. |
| Some genuine enquiries never arrive | FormSubmit silently drops submissions containing a phrase from the site's blacklist (`BLACKLIST` in `assets/js/site.js`: viagra, cialis, casino, porn, escort, payday loan, backlinks, guest post) or with the hidden honeypot field filled in. Edit the list if a genuine word is caught. |
| Spam arrives | Add phrases to `BLACKLIST`, and use the random-string alias (section 6, step 7). |
| Works on unnate.com but not on localhost or a preview address | Expected; test delivery on the live domain. |
| Form looks fine but the button does nothing | A JavaScript error. Open the Console; run `node tools/check-site.mjs` locally. |

FormSubmit is a free third-party service: it does not guarantee delivery and can change its terms. If you
publish a privacy notice, mention that enquiries are passed to FormSubmit.

---

# Reference

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
index.html, clinical-websites/, final-year-projects/, work/, 404.html     the pages
assets/css/site.css        the whole design system: tokens, components, every page's layout
assets/js/config.js        ← the values you edit: the two email addresses, FormSubmit alias, social links
assets/js/site.js          shared: navigation, reveals, the character, enquiry forms (→ FormSubmit), tabs, timeline
assets/js/home.js          homepage only: hero capsules and eyes, process card, drawer, verdict
assets/js/work.js          project rails, filters, hover previews and the viewer (home, /work/, landing pages)
assets/img/                icons.svg (wordmark and icons), mascot/, eyes/, og/ (social preview images)
assets/work/               optimised portfolio media (cards, full images, posters, films, website screenshots)
portfolio/portfolio.js     ← the portfolio data: one entry per project
demos/                     the three working website demos
_headers, _redirects       Cloudflare Pages headers and redirects
robots.txt, sitemap.xml, site.webmanifest, favicons
tools/dev-server.mjs       local preview (static files, folder URLs and the 404 page, like Cloudflare Pages)
tools/check-site.mjs       static checks (no dependencies)
tools/test-browser.mjs     browser checks (needs Playwright)
tools/build-media.mjs      regenerates assets/work/ from the originals in portfolio/ (needs sharp and ffmpeg)
tools/build-og.mjs, og.html  regenerate the social preview images (needs Playwright)
ASSETS.md                  every portfolio file, where it came from, and what is still missing
```

The header and footer are written into each page (there is no template step). If you change a link in
one, change it in all five HTML files.

## The enquiry forms

| Form | Subject line | Required |
|---|---|---|
| Homepage | Studio enquiry — *name* (*company*) | name, work email, company or brand, message |
| `/clinical-websites/` | Clinic website enquiry — *name* (*clinic*) | name, email, clinic or practice name, message |
| `/final-year-projects/` | Final-year project enquiry — *name* (*college*) | name, email, message |

Everything else is optional. Each email lists the visitor's answers under their on-page labels, the ticked
options, and the page the form was sent from; Reply goes to the visitor.

- **Validation:** required fields and the email format are checked in the browser before anything is sent.
- **Spam:** a hidden honeypot field (`_honey`) and a short phrase blacklist (`_blacklist`) are enforced by
  FormSubmit on its own servers. FormSubmit's reCAPTCHA is switched off (`_captcha=false`) because it cannot be
  shown to a form sent in the background. If spam becomes a problem, the next step is FormSubmit's
  random-string alias (section 6, step 7).
- **Duplicates:** the button is locked while a form is sending, and the form is replaced by the thank-you
  message once FormSubmit confirms it.
- **Failure:** if FormSubmit is unreachable, rejects the request or hasn't been activated, the visitor sees an
  error, keeps what they typed, and is offered both email addresses.
- **Limits:** FormSubmit is a free third-party service; it does not guarantee delivery and may change its
  terms. Your privacy notice, if you publish one, should mention that enquiries are passed to FormSubmit.

## Updating the portfolio

1. Put the original in `portfolio/websites/<name>/`, `portfolio/creatives/` or `portfolio/videos/`
   (these folders are ignored by git; only the optimised copies are deployed).
2. Add an entry to `portfolio/portfolio.js` (the header comment explains each field). `featured: true` puts it
   on the homepage rail; `tags: ['healthcare']` adds it to the clinic page's rail.
3. Regenerate media: `npm i sharp playwright && node tools/build-media.mjs` (needs ffmpeg).
   Add `--no-web` to skip website screenshots.
4. Run `node tools/check-site.mjs`.

## Still to do on your side

- Activate FormSubmit and run the three tests (sections 5 and 6).
- Supply `Modern Dental Studio Portrait.png`; a ready-made data entry is in `ASSETS.md`.
- Optional: privacy policy URL in `privacyUrl` and social links in `assets/js/config.js`.
