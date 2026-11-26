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

# One-click email enquiries. The address comes from assets/js/config.js (first entry of `emails`), never typed here.
_CFG = (pathlib.Path(__file__).resolve().parents[2] / "assets" / "js" / "config.js").read_text()
ENQUIRY_EMAIL = re.search(r"emails:\s*\[\s*'([^']+@[^']+)'", _CFG).group(1)
TALK = {  # key: (subject, what the visitor is interested in)
    "general": ("Project enquiry — UNNATE", "discussing a project with you"),
    "website": ("Website enquiry — UNNATE", "discussing a website with you"),
    "software": ("Software enquiry — UNNATE", "discussing custom software with you"),
    "one-page": ("Enquiry: One Page website — UNNATE", "the One Page website"),
    "five-pages": ("Enquiry: Five Pages website — UNNATE", "the Five Pages website"),
    "five-pages-written": ("Enquiry: Five Pages, Written website — UNNATE", "the Five Pages, Written website"),
    "tracker": ("Enquiry: Workflow Tracker — UNNATE", "the Workflow Tracker"),
    "operations-app": ("Enquiry: Operations App — UNNATE", "the Operations App"),
    "custom-system": ("Enquiry: Custom System — UNNATE", "a Custom System"),
    "question": ("Question — UNNATE", None),
}
def mailto(key):
    """A properly encoded mailto: link (RFC 6068): subject and a short, editable starter message."""
    from urllib.parse import quote
    subject, what = TALK[key]
    if what:
        body = f"Hi UNNATE,\n\nI'm interested in {what}. I'd like to know how you could help my business.\n\nLet's talk!"
    else:
        body = "Hi UNNATE,\n\nI have a quick question:\n\n"
    q = lambda t: quote(t, safe="")
    return f"mailto:{ENQUIRY_EMAIL}?subject={q(subject)}&amp;body={q(body.replace(chr(10), chr(13) + chr(10)))}"

NAV = [("/websites/", "Websites"), ("/software/", "Software"), ("/work/", "Demos"),
       ("/process/", "How we work"), ("/pricing/", "Pricing"), ("/about/", "About")]

def head(m):
    title = m["title"]; desc = m["description"]; path = m["path"]
    og = f"{SITE}/assets/img/og/{m.get('og', 'home.jpg')}"
    robots = f'<meta name="robots" content="{m["robots"]}">\n' if m.get("robots") else ""
    canon = "" if m.get("robots") else f'<link rel="canonical" href="{SITE}{path}">\n'
    ld = ""
    if m.get("ld") == "org":
        data = {"@context": "https://schema.org", "@type": "Organization", "name": "UNNATE", "url": SITE + "/",
                "logo": SITE + "/icon-512.png", "email": "aravind@unnate.com",
                "description": "Professional websites and custom business software for small and growing businesses, with fixed prices and a written scope.",
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
<meta name="theme-color" content="#F5F7FB">
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
    return f"""<header class="nav" data-nav>
  <div class="nav-pill">
    <a class="nav-logo" href="/"><svg viewBox="0 0 2180 662" aria-hidden="true" focusable="false"><use href="/assets/img/icons.svg#wm"/></svg><span class="vh">UNNATE home</span></a>
    <nav class="menu" id="menu" aria-label="Main">
{links}
      <a class="btn btn-ink btn-sm" href="{mailto('general')}" data-mailto aria-label="Let's talk: opens a ready-to-send email to UNNATE">Let's talk</a>
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
      </div>
      <nav aria-label="Services">
        <h2>Services</h2>
        <ul><li><a href="/websites/">Website Development</a></li><li><a href="/software/">Custom Business Software</a></li><li><a href="/work/">Demos</a></li><li><a href="/pricing/">Pricing</a></li></ul>
      </nav>
      <nav aria-label="Studio">
        <h2>Studio</h2>
        <ul><li><a href="/process/">How we work</a></li><li><a href="/about/">About</a></li><li><a href="/start/">Contact</a></li><li><a href="/qa/">Test report</a></li></ul>
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
CAP_WEB = """<span class="cap cap-web" aria-hidden="true"><svg viewBox="0 0 100 42" focusable="false"><rect x="22" y="7" width="56" height="30" rx="4" fill="#fff"/><rect x="22" y="7" width="56" height="7" rx="3" fill="#FFE1D3"/><circle cx="27" cy="10.5" r="1.4" fill="#FF5B1F"/><circle cx="31.5" cy="10.5" r="1.4" fill="#FFD23F"/><circle cx="36" cy="10.5" r="1.4" fill="#93E3C2"/><rect x="27" y="18" width="22" height="4" rx="2" fill="#10131C"/><rect x="27" y="25" width="16" height="2.6" rx="1.3" fill="#C9CEDB"/><rect x="27" y="30" width="12" height="3.4" rx="1.7" fill="#FF5B1F"/><rect x="54" y="18" width="19" height="14" rx="2" fill="#CFE2F8"/></svg></span>"""
CAP_SOFT = """<span class="cap cap-soft" aria-hidden="true"><svg viewBox="0 0 100 42" focusable="false"><circle class="live" cx="20" cy="21" r="4" fill="#93E3C2"/><rect class="bar" x="30" y="11" width="46" height="5" rx="2.5" fill="#fff"/><rect class="bar b2" x="30" y="19" width="36" height="5" rx="2.5" fill="#fff" fill-opacity=".85"/><rect class="bar b3" x="30" y="27" width="52" height="5" rx="2.5" fill="#FFD23F"/></svg></span>"""
def _ic(m): return f'<svg class="icon" aria-hidden="true"><use href="/assets/img/icons.svg#{m.group(1)}"/></svg>'
MDOT = '<span class="btn-dot"><svg aria-hidden="true"><use href="/assets/img/icons.svg#mail"/></svg></span>'
DOT = '<span class="btn-dot"><svg aria-hidden="true"><use href="/assets/img/icons.svg#arrow"/></svg></span>'
CTA = """<section class="sec">
  <div class="wrap">
    <div class="panel panel-royal cta on-dark" data-reveal>
      [[rt-cta]]
      <p class="eyebrow">Start here</p>
      <h2 class="d2">Tell us what you need. You get a written price.</h2>
      <p class="lede">Send a few lines about your business. We reply within one working day, talk it through on a short call, and send a written scope with a fixed price. You decide after that.</p>
      <div class="acts"><a class="btn btn-on-royal btn-lg" href="[[mailto:general]]" data-mailto aria-label="Let's talk: opens a ready-to-send email to UNNATE">Let's talk [[mdot]]</a><a class="link" href="/pricing/">View pricing [[arrow]]</a></div>
      [[mailhint-dark]]
    </div>
  </div>
</section>"""
RT_CTA = """<svg class="rt" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><path class="rt-l" d="M-30 470 C 220 420, 360 520, 600 480 S 960 400, 1230 450"/><path class="rt-l" d="M-30 60 C 200 100, 360 20, 600 50 S 980 110, 1230 40"/><path class="rt-l hi" d="M90 76 C 60 200, 70 330, 120 452"/><path class="rt-l hi" d="M1110 52 C 1150 180, 1140 320, 1090 446"/><circle class="rt-n" cx="90" cy="76" r="6"/><circle class="rt-n" cx="120" cy="452" r="6"/><circle class="rt-n" cx="1110" cy="52" r="6"/><circle class="rt-n" cx="1090" cy="446" r="6"/><circle class="rt-p" r="5"><animateMotion dur="9s" repeatCount="indefinite" path="M-30 470 C 220 420, 360 520, 600 480 S 960 400, 1230 450"/></circle><circle class="rt-p" r="4"><animateMotion dur="12s" begin="-5s" repeatCount="indefinite" path="M-30 60 C 200 100, 360 20, 600 50 S 980 110, 1230 40"/></circle></svg>"""
QA_ROWS = ["Screen sizes", "Links and anchors", "Contact", "Demos", "Accessibility", "Performance", "Security"]
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

def mailhint(dark=False):
    """Fallback for visitors without an email app: the address in plain text and a copy button."""
    e = ENQUIRY_EMAIL
    return (f'<p class="mailhint{" on-dark-hint" if dark else ""}" data-mailhint><span>Opens your email app with a short message ready to send.</span> '
            f'<span class="mh-alt">No email app? Write to <a href="mailto:{e}">{e}</a> '
            f'<button class="copy" type="button" data-copy="{e}" aria-label="Copy the email address {e}">Copy</button></span></p>')

def talk_preview(key="general"):
    """What the visitor will see in their email app, built from the same text as the link."""
    subject, what = TALK[key]
    e = html.escape
    return (f'<figure class="mail-preview" aria-label="Preview of the email that opens">'
            f'<p class="mp-row"><span>To</span><b>{e(ENQUIRY_EMAIL)}</b></p>'
            f'<p class="mp-row"><span>Subject</span><b>{e(subject)}</b></p>'
            f'<div class="mp-body"><p>Hi UNNATE,</p><p>I&#39;m interested in {e(what)}. I&#39;d like to know how you could help my business.</p><p>Let&#39;s talk!</p></div>'
            f'<figcaption>Edit it or send it as it is. Nothing is sent until you press Send.</figcaption></figure>')

def expand(body):
    body = body.replace("[[cta]]", CTA)
    body = body.replace("[[qa-sheet]]", _qa_sheet()) if "[[qa-sheet]]" in body else body
    body = re.sub(r"\[\[ic:([a-z-]+)\]\]", _ic, body)
    body = re.sub(r"\[\[mailto:([a-z-]+)\]\]", lambda m: mailto(m.group(1)), body)
    body = body.replace("[[talk-preview]]", talk_preview()) if "[[talk-preview]]" in body else body
    body = body.replace("[[mailhint-dark]]", mailhint(True)).replace("[[mailhint]]", mailhint()).replace("[[mdot]]", MDOT)
    return body.replace("[[cap-web]]", CAP_WEB).replace("[[cap-soft]]", CAP_SOFT).replace("[[dot]]", DOT).replace("[[rt-cta]]", RT_CTA).replace("[[arrow]]", ARROW)

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
