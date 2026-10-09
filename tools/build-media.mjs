// Regenerates the optimised portfolio media in assets/work/ from the originals in portfolio/.
// Usage:  npm i sharp playwright   (ffmpeg must be installed)   then   node tools/build-media.mjs
// Website thumbnails are screenshots of the real project files, so run this on a machine with
// normal internet access: the projects load their own web fonts and photos.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'assets/work');
const ctx = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'portfolio/portfolio.js'), 'utf8'), ctx);
const items = ctx.window.UNNATE_PORTFOLIO;

const card = (input, id) => sharp(input).resize(800, 1000, { fit: 'cover', position: 'top' }).webp({ quality: 78 }).toFile(path.join(out, `${id}.webp`));

for (const it of items.filter(i => i.type === 'creative')) {
  const src = path.join(root, it.src);
  await card(src, it.id);
  await sharp(src).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(out, `${it.id}-full.webp`));
  console.log('creative', it.id);
}
for (const it of items.filter(i => i.type === 'video')) {
  const tmp = path.join(out, `${it.id}.tmp.png`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(it.posterAt ?? 2), '-i', path.join(root, it.src), '-frames:v', '1', tmp]);
  await sharp(tmp).resize(800, 1000, { fit: 'cover', position: 'centre' }).webp({ quality: 78 }).toFile(path.join(out, `${it.id}.webp`));
  await sharp(tmp).resize({ width: 720 }).webp({ quality: 80 }).toFile(path.join(out, `${it.id}-poster.webp`));
  execFileSync('rm', [tmp]);
  console.log('video', it.id);
}
if (!process.argv.includes('--no-web')) {
  const { chromium } = require('playwright');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4' };
  const server = createServer(async (req, res) => {
    try {
      const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end(); }
  }).listen(0);
  const port = server.address().port;
  const browser = await chromium.launch();
  for (const it of items.filter(i => i.type === 'web')) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } });
    await page.goto(`http://localhost:${port}/${it.src.split('/').map(encodeURIComponent).join('/')}`, { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    const shot = await page.screenshot();
    await card(shot, it.id);
    await sharp(shot).resize({ width: 1400 }).webp({ quality: 80 }).toFile(path.join(out, `${it.id}-full.webp`));
    await page.close();
    console.log('web', it.id);
  }
  await browser.close();
  server.close();
}
