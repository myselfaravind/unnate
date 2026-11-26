#!/usr/bin/env python3
"""Builds the static pages from tools/site/pages/*.html.

Each page file starts with a front-matter block:
    ---
    path: /websites/
    title: Page title
    description: Meta description (keep under 160 characters)
    og: home.jpg            (optional; file in /assets/img/og/)
    nav: /websites/         (which menu item is current; optional)
    robots: noindex         (optional)
    ld: org                 (optional; adds Organization JSON-LD)
    ---
followed by the page's <main> content. Run:  python3 tools/site/build.py
The output is plain HTML committed to the repository; Cloudflare Pages serves it as-is (no build step).
"""
import json, pathlib, re, html

ROOT = pathlib.Path(__file__).resolve().parents[2]
PAGES = pathlib.Path(__file__).resolve().parent / "pages"
SITE = "https://unnate.com"

NAV = [("/websites/", "Websites"), ("/software/", "Software"), ("/pricing/", "Pricing"),
       ("/work/", "Work"), ("/process/", "How we work"), ("/about/", "About")]

def head(m):
    title = m["title"]; desc = m["description"]; path = m["path"]
    og = f"{SITE}/assets/img/og/{m.get('og', 'home.jpg')}"
    robots = f'<meta name="robots" content="{m["robots"]}">\n' if m.get("robots") else ""
    canon = "" if m.get("robots") else f'<link rel="canonical" href="{SITE}{path}">\n'
    ld = ""
    if m.get("ld") == "org":
        data = {"@context": "https://schema.org", "@type": "Organization", "name": "UNNATE", "url": SITE + "/",
                "logo": SITE + "/icon-512.png", "email": "aravind@unnate.com",
                "description": "Fixed-price websites and custom business software for small service businesses in Australia and the UK.",
                "areaServed": ["AU", "GB"]}
        ld = '<script type="application/ld+json">' + json.dumps(data, separators=(",", ":")) + "</script>\n"
    e = html.escape
    return f"""<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
{robots}{canon}<meta property="og:type" content="website">
<meta property="og:site_name" content="UNNATE">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{SITE}{path}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F4F3EE">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/mona-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/unnate.css">
{ld}</head>
<body>
<a class="skip" href="#main">Skip to content</a>
"""

def header(current):
    links = "\n".join(
        f'      <a href="{href}"' + (' aria-current="page"' if href == current else "") + f">{label}</a>"
        for href, label in NAV)
    cta_cur = ' aria-current="page"' if current == "/start/" else ""
    return f"""<header class="top">
  <div class="wrap top-in">
    <a class="logo" href="/"><svg viewBox="0 0 2180 662" aria-hidden="true" focusable="false"><use href="/assets/img/icons.svg#wm"/></svg><span class="vh">UNNATE home</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu">Menu</button>
    <nav class="menu" id="menu" aria-label="Main">
{links}
      <a class="btn btn-sm btn-go" href="/start/"{cta_cur}>Start a project</a>
    </nav>
  </div>
</header>
"""

FOOTER = """<footer class="foot">
  <div class="wrap foot-in">
    <div class="foot-brand">
      <a class="logo" href="/"><svg viewBox="0 0 2180 662" aria-hidden="true" focusable="false"><use href="/assets/img/icons.svg#wm"/></svg><span class="vh">UNNATE home</span></a>
      <p>Websites and business software, priced in the open. A small studio in India working with service businesses in Australia and the UK.</p>
      <p data-emails></p>
    </div>
    <nav aria-label="Footer">
      <a href="/websites/">Websites</a><a href="/software/">Software</a><a href="/pricing/">Pricing</a><a href="/work/">Work</a><a href="/process/">How we work</a><a href="/about/">About</a><a href="/start/">Start a project</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/qa/">QA report</a>
    </nav>
    <p class="small foot-legal">© <span data-year>2026</span> UNNATE. Prices in US dollars unless stated.</p>
  </div>
</footer>
<script src="/assets/js/config.js" defer></script>
<script src="/assets/js/unnate.js" defer></script>
</body>
</html>
"""

def parse(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    meta = dict(line.split(": ", 1) for line in m.group(1).splitlines() if line.strip())
    return meta, text[m.end():]

def build():
    out = []
    for f in sorted(PAGES.glob("*.html")):
        meta, body = parse(f.read_text())
        assert len(meta["description"]) <= 160, (f.name, len(meta["description"]))
        page = head(meta) + header(meta.get("nav", meta["path"])) + '<main id="main">\n' + body.strip() + "\n</main>\n" + FOOTER
        target = ROOT / ("404.html" if meta["path"] == "/404" else meta["path"].strip("/") + "/index.html" if meta["path"] != "/" else "index.html")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page)
        out.append(str(target.relative_to(ROOT)))
    print("built:", ", ".join(out))

if __name__ == "__main__":
    build()
