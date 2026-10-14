# UNNATE website

A static site: plain HTML, CSS and JavaScript, no framework, no build step and no server code. Enquiry forms
are delivered by FormSubmit (free, no account, no API key). Hosted on Cloudflare Pages from this repository.

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
assets/js/site.js          shared: navigation, reveals, the character, enquiry forms (→ FormSubmit), tabs, timeline
assets/js/home.js          homepage only: hero capsules and eyes, process card, drawer, verdict
assets/js/work.js          project rails, filters, hover previews and the viewer (home, /work/, landing pages)
assets/img/icons.svg       the wordmark and every icon
assets/img/mascot, eyes    the character's poses and expressions
assets/work/               optimised portfolio media (cards, full images, posters, films, website screenshots)
portfolio/portfolio.js     ← the portfolio data: one entry per project
_headers, _redirects       Cloudflare Pages headers and redirects
tools/dev-server.mjs       local preview (static files, folder URLs and the 404 page, like Cloudflare Pages)
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
node tools/dev-server.mjs        # http://localhost:8788
node tools/check-site.mjs        # static checks; exits non-zero if anything is broken
node tools/test-browser.mjs      # browser checks (needs Playwright); intercepts FormSubmit, so no email is sent
```

Test real enquiry delivery on the published site, not on localhost (see step 1 below).

## Before going live

1. **Activate FormSubmit (required — nothing is delivered until this is done).**
   Every form (home, `/clinical-websites/`, `/final-year-projects/`) posts the enquiry from the visitor's browser
   to FormSubmit's AJAX endpoint, `https://formsubmit.co/ajax/aravind@unnate.com`, with `saran@unnate.com`
   copied in through FormSubmit's `_cc` field. Visitors stay on the page. There is no key, secret or setting
   in Cloudflare.
   1. Deploy the site, open **https://unnate.com/** (the real address, not localhost or a preview link) and
      send one enquiry through the homepage form.
   2. **That first enquiry is not delivered.** FormSubmit instead emails **aravind@unnate.com** an activation
      message (“Action Required: Activate FormSubmit…”). The form on the site shows “Your enquiry wasn’t sent”,
      which is correct: FormSubmit answered that the form still needs activation. Check the spam folder too.
   3. Click **Activate Form** in that email. This is a one-time step for the address.
   4. If **saran@unnate.com** also receives a FormSubmit confirmation email, click its link as well. FormSubmit
      may ask copied-in addresses to confirm before they get copies.
   5. Send a fresh test enquiry from **each** of the three forms. Check that each one arrives in **both** inboxes,
      that the subject says which form it came from (“Clinic website enquiry — …”), and that pressing Reply
      answers the visitor's address.
   6. Optional: after activation FormSubmit emails a random string you can use instead of your address, so the
      address doesn't appear in the form request. Paste it into `formsubmitAlias` in `assets/js/config.js`.
   Until step 3 is done, every form shows its error message and nothing is lost on the visitor's side, but no
   enquiry reaches you. Nothing is ever shown as sent unless FormSubmit answers that it accepted it.
2. **Contact details** — the two addresses are `emails` in `assets/js/config.js`. They appear on every contact
   card (“Or email us directly”) and in the footer, and they are also where enquiries go: to the first, with
   the second copied in. Change them there and both the display and the delivery follow.
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
  random-string alias (step 6 above).
- **Duplicates:** the button is locked while a form is sending, and the form is replaced by the thank-you
  message once FormSubmit confirms it.
- **Failure:** if FormSubmit is unreachable, rejects the request or hasn't been activated, the visitor sees an
  error, keeps what they typed, and is offered both email addresses.
- **Limits:** FormSubmit is a free third-party service; it does not guarantee delivery and may change its
  terms. Your privacy notice, if you publish one, should mention that enquiries are passed to FormSubmit.

## Deploy

Commit and push. In Cloudflare Pages: no build command, output directory `/`. `_headers` and `_redirects` are
applied automatically. No environment variables are needed. If `RESEND_API_KEY`, `ENQUIRY_TO` or
`ENQUIRY_FROM` were ever added in Cloudflare Pages settings, they are no longer used and can be deleted.
