// Regenerates the device screenshots used in the site's desktop-and-phone mockups.
//
// Phone screens are captured at an iPhone 15 viewport (393 x 852 CSS px, 2x) and
// get a status bar, Dynamic Island and home indicator drawn above and below the page,
// so the CSS frame only has to draw a thin edge. Desktop shots are cropped at the
// bottom of each demo's hero, so no mockup ends on the next section.
//
// Needs: the dev server (node tools/dev-server.mjs) and Playwright with Chrome.
//   PLAYWRIGHT=/path/to/node_modules/playwright node tools/capture/devices.mjs OUT [names...]
//   python3 tools/capture/to_webp.py OUT
// names: tradie tracker ops maren (default: all). MAREN_SRC=<image> composes the
// dental demo's phone screen from an existing capture instead of the live page
// (useful where the demo's stock photos cannot load).
import { createRequire } from 'module';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const B = process.env.BASE || 'http://localhost:8788';
const [OUT = 'capture-out', ...only] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const want = n => !only.length || only.includes(n);

const b = await chromium.launch({ channel: 'chrome' });
const ctxFor = (w, h, dsf) => b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dsf, reducedMotion: 'reduce', bypassCSP: true });

// Open a demo clean: sample data reset, demo banner removed (each mockup is captioned as a demo instead).
async function open(ctx, url) {
  const p = await ctx.newPage();
  await p.goto(B + url, { waitUntil: 'networkidle' });
  await p.evaluate(() => { try { localStorage.clear(); } catch {} });
  await p.goto(B + url, { waitUntil: 'networkidle' });
  await p.evaluate(() => { document.querySelectorAll('.demo-banner, .demo').forEach(e => e.remove()); scrollTo(0, 0); return document.fonts.ready; });
  return p;
}

// Page content for a phone: 393 x 798 below a 54 px status bar.
async function phoneContent(url, prep) {
  const ctx = await ctxFor(393, 798, 2), p = await open(ctx, url);
  if (prep) await prep(p);
  await p.waitForTimeout(350);
  const png = await p.screenshot();
  await ctx.close();
  return 'data:image/png;base64,' + png.toString('base64');
}

const ICONS = `
<svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><rect x="0" y="7.6" width="3" height="4.4" rx="1"/><rect x="5" y="5.1" width="3" height="6.9" rx="1"/><rect x="10" y="2.6" width="3" height="9.4" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
<svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true"><path d="M8 2.5c2.3 0 4.4.9 6 2.4l1.3-1.3A10.6 10.6 0 0 0 8 .6 10.6 10.6 0 0 0 .7 3.6L2 4.9a8.6 8.6 0 0 1 6-2.4Z"/><path d="M8 6c1.4 0 2.6.5 3.6 1.4l1.3-1.3A7.1 7.1 0 0 0 8 4.1a7.1 7.1 0 0 0-4.9 2l1.3 1.3C5.4 6.5 6.6 6 8 6Z"/><path d="M8 9.4c.6 0 1.1.2 1.4.6L8 11.5 6.6 10c.3-.4.8-.6 1.4-.6Z"/></svg>
<svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true"><rect x=".5" y=".5" width="23.5" height="12" rx="3.8" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="2.2" y="2.2" width="20" height="8.6" rx="2.3"/><path d="M25.4 4.4v4.2c.8-.3 1.3-1.1 1.3-2.1s-.5-1.8-1.3-2.1Z" fill-opacity=".45"/></svg>`;

// Draw the phone screen: status bar, island, page, home indicator. Output 786 x 1704 PNG.
async function composePhone(src, out) {
  const ctx = await ctxFor(393, 852, 2), p = await ctx.newPage();
  await p.goto(B + '/robots.txt');
  await p.setContent(`<!doctype html><style>
@font-face{font-family:M;src:url(/assets/fonts/mona-sans.woff2) format("woff2");font-weight:200 900;font-stretch:75% 125%}
*{margin:0;box-sizing:border-box}html,body{background:#fff}
#f{position:relative;width:393px;height:852px;overflow:hidden;background:var(--bg,#fff)}
#f>img{position:absolute;left:0;top:54px;width:393px;height:798px;object-fit:cover;object-position:top}
.sb{position:absolute;left:0;right:0;top:0;height:54px;color:var(--fg,#000);background:var(--bg,#fff)}
.t{position:absolute;left:0;top:0;width:134px;height:59px;display:grid;place-items:center;padding-left:12px;font:600 17px/1 M;font-stretch:100%;letter-spacing:-.25px}
.isl{position:absolute;left:134px;top:11px;width:125px;height:37px;border-radius:19px;background:#000}
.ic{position:absolute;right:0;top:0;width:134px;height:59px;display:flex;align-items:center;justify-content:center;gap:5px;padding-right:12px}
.ic svg{fill:currentColor}
.hi{position:absolute;left:129.5px;bottom:8px;width:134px;height:5px;border-radius:3px;background:var(--hi,#000)}
</style><div id="f"><img id="im" src="${src}"><div class="sb"><span class="t">9:41</span><i class="isl"></i><span class="ic">${ICONS}</span></div><i class="hi"></i></div>`);
  await p.evaluate(async () => {
    const im = document.getElementById('im'); await im.decode(); await document.fonts.ready;
    const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const shownH = Math.round(im.naturalWidth * 798 / 393);            // rows of the source shown in the frame
    const avg = (y0, y1) => { const d = g.getImageData(0, y0, c.width, y1 - y0).data; let r = 0, gg = 0, bb = 0, n = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; bb += d[i + 2]; n++; } return [r / n, gg / n, bb / n]; };
    const lum = ([r, g2, b2]) => (0.2126 * r + 0.7152 * g2 + 0.0722 * b2) / 255;
    const top = avg(0, 2), bot = avg(Math.max(0, shownH - 24), shownH - 4);
    const f = document.getElementById('f');
    f.style.setProperty('--bg', `rgb(${top.map(Math.round).join(' ')})`);
    f.style.setProperty('--fg', lum(top) < .55 ? '#fff' : '#000');
    f.style.setProperty('--hi', lum(bot) < .55 ? 'rgb(255 255 255 / .9)' : 'rgb(0 0 0 / .85)');
  });
  await p.locator('#f').screenshot({ path: `${OUT}/${out}.png` });
  await ctx.close();
}

// Desktop: 1280 wide at 1.5x, cropped at the bottom edge of the demo's hero.
async function desktopHero(url, out, sel = '.hero') {
  const ctx = await ctxFor(1280, 800, 1.5), p = await open(ctx, url);
  await p.waitForTimeout(300);
  const h = await p.evaluate(s => Math.round(document.querySelector(s).getBoundingClientRect().bottom), sel);
  await p.screenshot({ path: `${OUT}/${out}.png`, clip: { x: 0, y: 0, width: 1280, height: h } });
  await ctx.close();
}

if (want('tradie')) {
  await desktopHero('/demos/tallow-creek-plumbing/', 'tradie-hero');
  await composePhone(await phoneContent('/demos/tallow-creek-plumbing/'), 'tradie-phone');
}
if (want('tracker')) {
  // Scroll past the counts and filters so the phone shows the job list itself.
  await composePhone(await phoneContent('/demos/job-tracker/', async p => {
    await p.evaluate(() => { const t = document.querySelector('#jobs'); scrollTo(0, t ? t.getBoundingClientRect().top + scrollY - 12 : 0); });
  }), 'tracker-phone');
}
if (want('ops')) {
  await composePhone(await phoneContent('/demos/operations-app/'), 'ops-phone');
}
if (want('maren')) {
  if (!process.env.MAREN_SRC) await desktopHero('/demos/maren-dental-studio/', 'maren-hero');
  const src = process.env.MAREN_SRC
    ? 'data:image/webp;base64,' + readFileSync(process.env.MAREN_SRC).toString('base64')
    : await phoneContent('/demos/maren-dental-studio/');
  await composePhone(src, 'maren-phone');
}
await b.close();
writeFileSync(`${OUT}/done.txt`, new Date().toISOString());
console.log('captured to', OUT);
