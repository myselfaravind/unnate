# UNNATE website — deployment guide

A static website: no server code, no build step, no database. Upload the files and it runs.

## What's in this package

```
index.html            the website
assets/img/           site images (WebP)
portfolio/            empty folders for your real work (see portfolio/README.md)
favicon.ico, favicon-32x32.png, apple-touch-icon.png, icon-192.png, icon-512.png
site.webmanifest      app/home-screen metadata
og-image.jpg          1200×630 image shown when the link is shared
robots.txt            lets search engines crawl everything
sitemap.xml           tells search engines which URL to index
DEPLOY.md             this file (safe to delete before upload)
```

---

## 1. Before you upload — values only you can provide

These are deliberately left empty or as placeholders, because inventing them would be wrong.

1. **Your domain (required).** Find-and-replace `https://YOUR-DOMAIN.com/` with your real address
   (e.g. `https://unnate.com/` — keep the trailing slash) in **index.html**, **robots.txt** and **sitemap.xml**.
   It appears 11 times in index.html (canonical, social previews, structured data).
2. **Where enquiries go (required).** In index.html, search for `const FORM_ENDPOINT = ''` and paste the endpoint
   from a form service (Formspree, Basin, Web3Forms…) or your own API. Until this is set, the "Start a Project"
   form cannot deliver messages. Optional fallback: `CONTACT_EMAIL` (opens the visitor's email app instead).
3. **Your portfolio (required for Section 03).** Add the 3 website demos, 5 videos and 5 creatives —
   follow **portfolio/README.md**. Until real work is added, the section shows labelled "Coming soon" frames;
   once any real piece exists, empty slots disappear automatically.
4. **Company details (optional).** `const COMPANY = { email:'', location:'', team:'' }` — filled values appear
   in the footer and About section. Only add verified details.
5. **Check one illustration detail.** The illustrated ad mockups in the hero and "What We Do" show
   `unnate.com` as the advertiser URL. If your domain is different, tell your developer (or me) to update it.

## 2. Upload

Upload the **contents** of this folder to your web root, keeping the folder structure exactly as it is.

- **cPanel / shared hosting:** upload everything into `public_html/`.
- **Netlify:** drag the folder onto app.netlify.com → "Deploy manually".
- **Vercel / Cloudflare Pages / GitHub Pages:** create a project from this folder; no build command, output = root.

Then:
- Turn on **HTTPS** (all modern hosts do this for free).
- Choose one version of the address (with or without `www.`) and redirect the other to it — it must match the
  domain you put in step 1.
- Open the site on a phone and a laptop, submit a test enquiry, and share the link in a chat app to confirm the
  preview image appears.

Optional, if your host allows headers: cache `assets/`, `portfolio/` and images for a year; `index.html` for a
few minutes. Fonts load from Google Fonts.

---

## 3. Google Search Console (you do this — it needs your Google account)

1. Go to **search.google.com/search-console** → **Add property**.
2. Choose **Domain** (covers http/https and www) and verify with the **DNS TXT record** Google gives you, added at
   your domain registrar. (Or choose **URL prefix** and verify with the HTML-tag or HTML-file method.)
3. Open **Sitemaps** → submit `sitemap.xml`.
4. Open **URL Inspection** → paste your homepage URL → **Request indexing**.
5. Over the following weeks, check **Pages** (is it indexed?) and **Performance** (which searches show you).

Indexing usually takes days, not hours. No one can guarantee a ranking; the site is set up so Google can read it
correctly — the real work, updated regularly, is what earns visibility.

## 4. Google Business Profile (only if it applies)

A Business Profile is for businesses with a physical location customers visit, or a defined service area.
The website has no verified address, so none was added to the code.

If UNNATE qualifies:
1. Go to **business.google.com** → **Add your business**.
2. Use the exact name **UNNATE**, the category that fits best (e.g. "Website designer" / "Marketing agency"),
   and your real address or service area.
3. Complete Google's verification (video, postcard or phone, depending on what Google offers).
4. Add the website URL, hours and real photos of your work.
5. Once verified, send me the exact public details and I can add matching LocalBusiness structured data.

---

## 5. What was implemented

**SEO:** descriptive title and meta description · canonical URL · robots meta · Open Graph + X/Twitter large card
with a real 1200×630 image · Organization + WebSite structured data (no invented address, phone, reviews or
socials) · robots.txt · sitemap.xml · one H1, logical H2/H3 structure · descriptive alt text · crawlable text
(no hidden SEO text) · favicons and web manifest.

**Performance:** images served as separate, cacheable WebP files (index.html went from ~845 KB to ~190 KB) ·
everything below the hero lazy-loads · hero image fetched first · videos never download until played ·
video posters load only as they approach · videos pause when scrolled away · no new libraries.

**Portfolio system:** 3 website slots, 5 creative slots, 5 video slots · live, scrollable website previews
(or honest full-page captures) · empty slots hidden automatically once real work exists · truthful
"Concept · Self-initiated" / "Client work" labels.

**QA:** tested at 320, 375, 390, 430, 768, 1024, 1280, 1440 and 1920px — no horizontal overflow, no broken
images or requests, no script errors · keyboard navigation, focus states, reduced motion and touch behaviour
checked · custom cursors appear only with a mouse.
