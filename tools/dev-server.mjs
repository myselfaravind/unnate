// Local preview of the static site:  node tools/dev-server.mjs  →  http://localhost:8788
// Serves folders as /folder/ (redirecting /folder), and the site's 404 page for unknown addresses, like
// Cloudflare Pages. Enquiry forms post to FormSubmit (formsubmit.co) directly from the browser; test real
// delivery on the published site, not here (see DEPLOY.md).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Apply _headers and _redirects the way Cloudflare Pages does (enough for local testing):
// every matching _headers block adds its headers in order; a "! Name" line removes a header set earlier.
const readText = async f => { try { return await readFile(path.join(root, f), 'utf8'); } catch { return ''; } };
const headerRules = (await readText('_headers')).split(/\n(?=\S)/).map(block => {
  const [pat, ...lines] = block.split('\n').filter(l => l.trim() && !l.trim().startsWith('#'));
  if (!pat || pat.startsWith(' ')) return null;
  const re = new RegExp('^' + pat.trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
  return { re, lines: lines.map(l => l.trim()) };
}).filter(Boolean);
const headersFor = p => {
  const h = {};
  for (const r of headerRules) if (r.re.test(p)) for (const l of r.lines) {
    if (l.startsWith('! ')) { delete h[l.slice(2).trim().toLowerCase()]; continue; }
    const i = l.indexOf(':'); if (i > 0) h[l.slice(0, i).trim().toLowerCase()] = l.slice(i + 1).trim();
  }
  return h;
};
const redirects = new Map((await readText('_redirects')).split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => { const [from, to, code] = l.split(/\s+/); return [from, [to, Number(code || 302)]]; }));
const port = Number(process.env.PORT || 8788);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain', '.md': 'text/plain; charset=utf-8' };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const extra = headersFor(url.pathname);
  for (const [k, v] of Object.entries(extra)) res.setHeader(k, v);
  if (redirects.has(url.pathname)) { const [to, code] = redirects.get(url.pathname); res.writeHead(code, { location: to }); res.end(); return; }
  try {
    let file = path.join(root, decodeURIComponent(url.pathname));
    if (!file.startsWith(root)) throw new Error('outside root');
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith('/')) { res.writeHead(301, { location: url.pathname + '/' }); res.end(); return; }
      file = path.join(file, 'index.html');
    }
    const body = await readFile(file);
    const range = req.headers.range && /bytes=(\d+)-(\d*)/.exec(req.headers.range);
    if (range) {
      const start = Number(range[1]), end = range[2] ? Number(range[2]) : body.length - 1;
      res.writeHead(206, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'content-range': `bytes ${start}-${end}/${body.length}`, 'accept-ranges': 'bytes', 'content-length': end - start + 1 });
      res.end(body.subarray(start, end + 1)); return;
    }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'accept-ranges': 'bytes' });
    res.end(body);
  } catch {
    // like Cloudflare Pages: the site's own 404 page, with a 404 status
    try { res.writeHead(404, { 'content-type': types['.html'] }); res.end(await readFile(path.join(root, '404.html'))); }
    catch { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('Not found'); }
  }
}).listen(port, () => console.log(`UNNATE preview → http://localhost:${port}`));
