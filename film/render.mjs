// Renders the film frame-by-frame in headless Chromium and encodes it with ffmpeg.
//   node render.mjs                      → build/frames + out/unnate-brand-film.mp4
//   node render.mjs --stills 0.2,4.3     → build/stills/t*.jpg (quick look at moments)
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const dir = import.meta.dirname;
const args = process.argv.slice(2);
const stills = args.includes('--stills') ? args[args.indexOf('--stills') + 1].split(',').map(Number) : null;
const range = args.includes('--range') ? args[args.indexOf('--range') + 1].split(',').map(Number) : null;

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--allow-file-access-from-files', '--disable-web-security', '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.goto('file://' + path.join(dir, 'src/index.html'));
await page.evaluate(() => window.ready);
const { FPS, DUR } = await page.evaluate(() => window.FILM);

async function shot(t, file) {
  await page.evaluate((tt) => window.seek(tt), t);
  await page.screenshot({ path: file, type: 'jpeg', quality: 95 });
}

if (stills) {
  const out = path.join(dir, 'build/stills'); fs.mkdirSync(out, { recursive: true });
  for (const t of stills) await shot(t, path.join(out, `t${t.toFixed(2)}.jpg`));
  console.log('stills →', out);
} else {
  const out = path.join(dir, 'build/frames'); fs.mkdirSync(out, { recursive: true });
  const n = Math.round(DUR * FPS);
  const [a, b] = range || [0, n];
  const t0 = Date.now();
  for (let i = a; i < b; i++) {
    await shot(i / FPS, path.join(out, String(i).padStart(4, '0') + '.jpg'));
    if (i % 60 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  console.log('frames done');
}
await browser.close();
