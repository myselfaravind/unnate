// Local preview of the static site:  node tools/dev-server.mjs  →  http://localhost:8788
// Serves folders as /folder/ (redirecting /folder), and the site's 404 page for unknown addresses, like
// Cloudflare Pages. Enquiry forms post to FormSubmit (formsubmit.co) directly from the browser; test real
// delivery on the published site, not here (see DEPLOY.md).
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8788);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain', '.md': 'text/plain; charset=utf-8' };

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
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
