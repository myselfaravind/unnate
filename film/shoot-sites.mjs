// Captures hero screenshots of the real portfolio websites for the film.
import { chromium } from 'playwright';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(import.meta.dirname, 'build/media');
const sites = ['Maren Dental Studio', 'Oddcard', 'TickPic Moments'];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
for (const s of sites) {
  const url = 'file://' + path.join(root, 'portfolio/websites', s, 'index.html');
  const slug = s.toLowerCase().replace(/\s+/g, '-');
  for (const [tag, vp] of [['desk', { width: 1440, height: 900 }], ['mob', { width: 390, height: 844 }]]) {
    const p = await browser.newPage({ viewport: vp, deviceScaleFactor: tag === 'mob' ? 2 : 1 });
    await p.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${slug}-${tag}.jpg`, quality: 90 });
    await p.close();
  }
}
await browser.close();
