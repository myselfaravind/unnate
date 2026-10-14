// Regenerates the optimised portfolio media in assets/ from the originals in portfolio/.
// Usage:  npm i sharp playwright   (ffmpeg must be installed)   then   node tools/build-media.mjs [--no-web]
//   creatives → assets/work/<id>.webp (4:5 card) and <id>-full.webp (viewer)
//   videos    → assets/work/<id>.webp, <id>-poster.webp, video/<id>.mp4 (web encode), video/<id>-preview.mp4
//               (5 s, muted, starting 4 s before posterAt unless the entry sets previewAt)
//   websites  → assets/work/sites/<name>-0/-1/-2.webp, -m.webp, -card.webp, rendered from demos/<id>/index.html
// Originals are listed in portfolio/portfolio.js (src). Website thumbnails are screenshots of the real demo files,
// so run this with normal internet access: the demos load their own web fonts and photos.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = p => path.join(root, p.replace(/^\//, ''));
const ctx = { window: {} };
vm.runInNewContext(await readFile(path.join(root, 'portfolio/portfolio.js'), 'utf8'), ctx);
const items = ctx.window.UNNATE_PORTFOLIO;
await mkdir(out('assets/work/video'), { recursive: true });
await mkdir(out('assets/work/sites'), { recursive: true });
const card = (input, file, position = 'top') => sharp(input).resize(800, 1000, { fit: 'cover', position }).webp({ quality: 78 }).toFile(out(file));
const ff = args => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args]);

for (const it of items) {
  if (!it.src) continue;
  const src = path.join(root, it.src);
  if (!existsSync(src)) { console.warn('missing original, skipped:', it.src); continue; }
  if (it.type === 'creative') {
    await card(src, it.thumb);
    await sharp(src).resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out(it.full));
  }
  if (it.type === 'video') {
    const tmp = out(`assets/work/${it.id}.tmp.png`);
    ff(['-ss', String(it.posterAt ?? 2), '-i', src, '-frames:v', '1', tmp]);
    await card(tmp, it.thumb, 'centre');
    await sharp(tmp).resize({ width: 720 }).webp({ quality: 80 }).toFile(out(it.poster));
    await rm(tmp);
    ff(['-i', src, '-c:v', 'libx264', '-preset', 'slow', '-crf', '25', '-maxrate', '2400k', '-bufsize', '4800k', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'aac', '-b:a', '96k', out(it.video)]);
    ff(['-ss', String(it.previewAt ?? Math.max(0, (it.posterAt ?? 2) - 4)), '-t', '5', '-i', src, '-an', '-vf', 'scale=360:640', '-c:v', 'libx264', '-preset', 'slow', '-crf', '29', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out(it.preview)]);
  }
  console.log(it.type, it.id);
}

if (!process.argv.includes('--no-web')) {
  const { chromium } = require('playwright');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
  const server = createServer(async (req, res) => {
    try {
      let file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (file.endsWith('/')) file += 'index.html';
      res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
      res.end(await readFile(file));
    } catch { res.writeHead(404); res.end(); }
  }).listen(0);
  const port = server.address().port;
  const browser = await chromium.launch();
  for (const it of items.filter(i => i.type === 'web' && i.demoUrl && i.case)) {
    const name = path.basename(it.case.phone).replace(/-m\.webp$/, '');
    const desk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desk.goto(`http://localhost:${port}${it.demoUrl}`, { waitUntil: 'load' });
    await desk.waitForTimeout(4000);
    const full = await desk.screenshot({ fullPage: true });
    await sharp(full).resize({ width: 1400 }).webp({ quality: 80 }).toFile(out(it.full));
    const meta = await sharp(full).metadata();
    // three frames down the page: the opening, a third of the way, two thirds of the way
    for (const [n, f] of [[0, 0], [1, 1 / 3], [2, 2 / 3]]) {
      const top = Math.min(meta.height - 900, Math.round((meta.height - 900) * f));
      await sharp(full).extract({ left: 0, top, width: 1440, height: 900 }).resize({ width: 1200 }).webp({ quality: 80 }).toFile(out(`assets/work/sites/${name}-${n}.webp`));
    }
    await sharp(full).extract({ left: 0, top: 0, width: 1440, height: 900 }).resize({ width: 1200 }).webp({ quality: 80 }).toFile(out(`assets/work/${it.id}-wide.webp`));
    await desk.close();
    const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1.5 });
    await phone.goto(`http://localhost:${port}${it.demoUrl}`, { waitUntil: 'load' });
    await phone.waitForTimeout(4000);
    const shot = await phone.screenshot();
    await sharp(shot).webp({ quality: 80 }).toFile(out(it.case.phone));
    await card(shot, it.thumb);
    await phone.close();
    console.log('web', it.id, '(check the -1 and -2 frames: they are taken at fixed points down the page)');
  }
  await browser.close();
  server.close();
}
