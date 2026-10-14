// Renders the social preview images (assets/img/og/*.jpg) from tools/og.html.
// Usage: node tools/dev-server.mjs   (in another terminal), then:  node tools/build-og.mjs
// Needs Playwright with a Chromium browser:  npm i playwright && npx playwright install chromium
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = process.env.BASE || 'http://localhost:8788';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const id of ['home', 'clinical-websites', 'final-year-projects']) {
  await page.goto(`${base}/tools/og.html?page=${id}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(root, 'assets/img/og', `${id}.jpg`), type: 'jpeg', quality: 86 });
  console.log('og', id);
}
await browser.close();
