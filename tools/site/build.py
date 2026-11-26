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
<meta name="theme-color" content="#F2F5F9">
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/mona-sans.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/gochi-hand.woff2" as="font" type="font/woff2" crossorigin>
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
    return f"""<header class="nav" data-nav>
  <div class="nav-pill">
    <a class="nav-logo" href="/"><svg viewBox="0 0 2180 662" aria-hidden="true" focusable="false"><use href="/assets/img/icons.svg#wm"/></svg><span class="vh">UNNATE home</span></a>
    <nav class="menu" id="menu" aria-label="Main">
{links}
      <a class="btn btn-ink btn-sm" href="/start/"{cta_cur}>Start a project</a>
    </nav>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu"><span class="bars" aria-hidden="true"></span>Menu</button>
  </div>
</header>
"""

ARROW = '<svg aria-hidden="true"><use href="/assets/img/icons.svg#arrow"/></svg>'

FOOTER = """<footer class="foot">
  <div class="wrap">
    <div class="foot-top">
      <div>
        <p class="foot-say">Fixed price. Written scope. <span>Yours to keep.</span></p>
        <p class="hand hand-butter">websites + business software, priced in the open</p>
      </div>
      <nav aria-label="Services">
        <h2>Services</h2>
        <ul><li><a href="/websites/">Website Development</a></li><li><a href="/software/">Custom Business Software</a></li><li><a href="/pricing/">Pricing</a></li><li><a href="/work/">Work and demos</a></li></ul>
      </nav>
      <nav aria-label="Studio">
        <h2>Studio</h2>
        <ul><li><a href="/process/">How we work</a></li><li><a href="/about/">About</a></li><li><a href="/start/">Start a project</a></li><li><a href="/qa/">Test report</a></li></ul>
      </nav>
      <div>
        <h2>Contact</h2>
        <p data-emails data-emails-list></p>
        <p class="small mt-1">Monday to Friday, 10:00–19:00 India time.</p>
      </div>
    </div>
    <svg class="foot-word" viewBox="0 0 2180 662" aria-hidden="true" focusable="false"><use href="/assets/img/icons.svg#wm"/></svg>
    <div class="foot-legal"><p>© <span data-year>2026</span> UNNATE. Prices in US dollars unless stated.</p><p><a href="/privacy/">Privacy</a> · <a href="/terms/">Terms</a></p></div>
  </div>
</footer>
<script src="/assets/js/config.js" defer></script>
<script src="/assets/js/unnate.js" defer></script>
</body>
</html>
"""


# ---- small macros used in page files, so markup stays readable ----
import itertools
_eye_ids = itertools.count()
def _eyes(m=None):
    n = next(_eye_ids)
    return f"""<span class="cap cap-eyes" data-eyes aria-hidden="true"><svg viewBox="30 30 500 196" preserveAspectRatio="xMidYMid slice" focusable="false"><defs><clipPath id="eyc{n}a"><path d="M94.3 51.7L252 78.7A89.3 71.4 0 1 1 94.3 51.7Z"/></clipPath><clipPath id="eyc{n}b"><path d="M310 91.1L470.9 118.4A90.9 69.6 -2.4 1 1 310 91.1Z"/></clipPath><linearGradient id="eyw{n}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B42F00" stop-opacity=".75"/><stop offset="1" stop-color="#D93A00" stop-opacity="0"/></linearGradient><radialGradient id="eyb{n}" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#FF4F0C"/><stop offset="1" stop-color="#F23F03"/></radialGradient></defs><rect x="0" y="0" width="558" height="252" fill="url(#eyb{n})"/><path d="M52 44.5L96 52L88 80Z" fill="url(#eyw{n})"/><path d="M252 78.7L256 82L304 90L299 120Z" fill="url(#eyw{n})"/><path d="M471 118.4L512 125.3L464 166Z" fill="url(#eyw{n})"/><path d="M94.3 51.7L252 78.7A89.3 71.4 0 1 1 94.3 51.7Z" fill="#F4EEE4"/><path d="M310 91.1L470.9 118.4A90.9 69.6 -2.4 1 1 310 91.1Z" fill="#F4EEE4"/><g clip-path="url(#eyc{n}a)"><ellipse class="pupil" cx="95.9" cy="94.5" rx="21.3" ry="36.8" fill="#191716"/><rect class="lid" x="60" y="30" width="230" height="150" fill="#F9450A"/></g><g clip-path="url(#eyc{n}b)"><ellipse class="pupil" cx="310.9" cy="133.2" rx="21.3" ry="36.8" fill="#191716"/><rect class="lid" x="280" y="70" width="230" height="150" fill="#F9450A"/></g></svg></span>"""
CAP_WEB = """<span class="cap cap-web" aria-hidden="true"><svg viewBox="0 0 100 42" focusable="false"><rect x="22" y="7" width="56" height="30" rx="4" fill="#fff"/><rect x="22" y="7" width="56" height="7" rx="3" fill="#FFE1D3"/><circle cx="27" cy="10.5" r="1.4" fill="#FF5B1F"/><circle cx="31.5" cy="10.5" r="1.4" fill="#FFD23F"/><circle cx="36" cy="10.5" r="1.4" fill="#93E3C2"/><rect x="27" y="18" width="22" height="4" rx="2" fill="#10131C"/><rect x="27" y="25" width="16" height="2.6" rx="1.3" fill="#C9CEDB"/><rect x="27" y="30" width="12" height="3.4" rx="1.7" fill="#FF5B1F"/><rect x="54" y="18" width="19" height="14" rx="2" fill="#CFE2F8"/></svg></span>"""
CAP_SOFT = """<span class="cap cap-soft" aria-hidden="true"><svg viewBox="0 0 100 42" focusable="false"><circle class="live" cx="20" cy="21" r="4" fill="#93E3C2"/><rect class="bar" x="30" y="11" width="46" height="5" rx="2.5" fill="#fff"/><rect class="bar b2" x="30" y="19" width="36" height="5" rx="2.5" fill="#fff" fill-opacity=".85"/><rect class="bar b3" x="30" y="27" width="52" height="5" rx="2.5" fill="#FFD23F"/></svg></span>"""
def _ic(m): return f'<svg class="icon" aria-hidden="true"><use href="/assets/img/icons.svg#{m.group(1)}"/></svg>'
DOT = '<span class="btn-dot"><svg aria-hidden="true"><use href="/assets/img/icons.svg#arrow"/></svg></span>'
SCRIB = '<svg aria-hidden="true"><use href="/assets/img/icons.svg#scribble"/></svg>'
QA_ROWS = ["Screen sizes", "Links and anchors", "Forms", "Demos", "Accessibility", "Performance", "Security"]
def _qa_sheet():
    """The little printed report on the home page. Counts come from qa/summary.json, written by the real QA run."""
    try:
        d = json.loads((ROOT / "qa" / "summary.json").read_text())
    except (OSError, ValueError):
        d = {}
    g = {x["name"]: x for x in d.get("groups", [])}
    rows = []
    for name in QA_ROWS:
        x = g.get(name)
        val = f'{x["passed"]}/{x["total"]}' if x else "—"
        cls = "" if (not x or x["passed"] == x["total"]) else ' class="qs-x"'
        rows.append(f'<span class="qs-r"><span>{name}</span><b{cls}>{val}</b></span>')
    date = (d.get("date") or "").split(" ")[0] or "not run yet"
    return ('<span class="qa-sheet" aria-hidden="true"><span class="qs-h"><b>Test report</b><i>unnate.com · ' + date + '</i></span>'
            + "".join(rows) + '<span class="stamp">Published</span></span>')

def expand(body):
    body = body.replace("[[qa-sheet]]", _qa_sheet()) if "[[qa-sheet]]" in body else body
    body = re.sub(r"\[\[eyes\]\]", _eyes, body)
    body = re.sub(r"\[\[ic:([a-z-]+)\]\]", _ic, body)
    return body.replace("[[cap-web]]", CAP_WEB).replace("[[cap-soft]]", CAP_SOFT).replace("[[dot]]", DOT).replace("[[scrib]]", SCRIB).replace("[[arrow]]", ARROW)

def parse(text):
    m = re.match(r"---\n(.*?)\n---\n", text, re.S)
    meta = dict(line.split(": ", 1) for line in m.group(1).splitlines() if line.strip())
    return meta, text[m.end():]

def build():
    out = []
    for f in sorted(PAGES.glob("*.html")):
        meta, body = parse(f.read_text())
        assert len(meta["description"]) <= 160, (f.name, len(meta["description"]))
        page = head(meta) + header(meta.get("nav", meta["path"])) + '<main id="main">\n' + expand(body.strip()) + "\n</main>\n" + FOOTER
        target = ROOT / ("404.html" if meta["path"] == "/404" else meta["path"].strip("/") + "/index.html" if meta["path"] != "/" else "index.html")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(page)
        out.append(str(target.relative_to(ROOT)))
    print("built:", ", ".join(out))

if __name__ == "__main__":
    build()
