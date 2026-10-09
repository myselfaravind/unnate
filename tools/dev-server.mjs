// Local preview: serves the site and runs the real enquiry function at /api/enquiry.
//   node tools/dev-server.mjs                  → form shows its error state (no email settings)
//   MOCK_EMAIL=1 node tools/dev-server.mjs     → pretends Resend accepted the email (prints it here)
//   MOCK_EMAIL=fail node tools/dev-server.mjs  → pretends Resend rejected the email
//   RESEND_API_KEY=… ENQUIRY_TO=… node tools/dev-server.mjs → sends real email
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as enquiry from '../functions/api/enquiry.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 8788);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.xml': 'application/xml', '.txt': 'text/plain' };

const env = { ...process.env };
if (process.env.MOCK_EMAIL) {
  env.RESEND_API_KEY ||= 'mock'; env.ENQUIRY_TO ||= 'studio@example.test';
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (String(url).startsWith('https://api.resend.com/')) {
      console.log('\n[mock Resend] would send:\n', JSON.parse(init.body));
      return process.env.MOCK_EMAIL === 'fail' ? new Response('{"message":"mock failure"}', { status: 500 }) : new Response('{"id":"mock"}', { status: 200 });
    }
    return real(url, init);
  };
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/enquiry') {
    const chunks = []; for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const handler = req.method === 'POST' ? enquiry.onRequestPost : enquiry.onRequest;
    const out = await handler({ request, env });
    res.writeHead(out.status, Object.fromEntries(out.headers)); res.end(await out.text());
    return;
  }
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
  } catch { res.writeHead(404, { 'content-type': 'text/plain' }); res.end('Not found'); }
}).listen(port, () => console.log(`UNNATE preview → http://localhost:${port}`));
