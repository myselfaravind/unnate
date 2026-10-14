// Static checks for the whole site, no browser needed:  node tools/check-site.mjs
//  1. every local href/src/use/url() in HTML, CSS, JS and portfolio data points at a real file
//  2. every file in assets/ is referenced somewhere (reports unused files)
//  3. no page shows a price (₹, Rs. or INR followed by a number)
//  4. each page has one <h1>, a <title>, a meta description and, unless noindex, a canonical URL
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = async d => (await Promise.all((await readdir(d, { withFileTypes: true })).map(e => {
  const p = path.join(d, e.name);
  if (['.git', 'node_modules', 'demos'].includes(e.name)) return [];
  return e.isDirectory() ? walk(p) : [p];
}))).flat();
const files = await walk(root);
const rel = p => '/' + path.relative(root, p).split(path.sep).join('/');
const pages = files.filter(f => f.endsWith('.html') && !f.includes(`${path.sep}tools${path.sep}`));
const sources = files.filter(f => /\.(html|css|js|mjs)$/.test(f) && !f.includes(`${path.sep}tools${path.sep}`));
let problems = 0;
const bad = (...m) => { problems++; console.log('✗', ...m); };
const refs = new Set();
const resolve = (ref, from) => {
  ref = ref.split('#')[0].split('?')[0];
  if (!ref || /^(https?:|mailto:|tel:|data:|javascript:|\$\{)/.test(ref) || ref.includes('${')) return null;
  const abs = ref.startsWith('/') ? ref : path.posix.join(path.posix.dirname(rel(from)), ref);
  return decodeURIComponent(abs);
};
const exists = p => {
  const f = path.join(root, p);
  if (p.endsWith('/')) return existsSync(path.join(f, 'index.html'));
  return existsSync(f);
};
for (const f of sources) {
  const s = await readFile(f, 'utf8');
  const found = [...s.matchAll(/(?:href|src|poster)="([^"]+)"|url\((?!["']?data:)["']?([^)"']+)["']?\)|'(\/(?:assets|demos|portfolio)\/[^']+)'|data-(?:feelings|stage-poses)="([^"]+)"/g)]
    .flatMap(m => (m[4] ? m[4].split(' ') : [m[1] || m[2] || m[3]]));
  for (const r of found) {
    const p = resolve(r, f); if (!p) continue;
    refs.add(p);
    if (!exists(p) && !p.startsWith('/api/')) bad('broken reference', r, 'in', rel(f));
  }
}
// unused assets
for (const f of files.filter(f => rel(f).startsWith('/assets/') && !/LICENSE|\/og\//.test(f))) {   // og images are linked by full URL
  if (!refs.has(rel(f))) console.log('· unused asset', rel(f));
}
// page checks
for (const f of pages) {
  const s = await readFile(f, 'utf8'), r = rel(f);
  if ((s.match(/<h1[\s>]/g) || []).length !== 1) bad(r, 'should have exactly one <h1>');
  if (!/<title>[^<]+<\/title>/.test(s)) bad(r, 'missing <title>');
  if (!/<meta name="description" content="[^"]{30,}"/.test(s)) bad(r, 'missing meta description');
  if (!/noindex/.test(s) && !/<link rel="canonical" href="https:\/\/unnate\.com\//.test(s)) bad(r, 'missing canonical');
  const text = s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
  if (/(₹|\bRs\.?\s?\d|\bINR\s?\d)/.test(text)) bad(r, 'shows a price');
  const ids = [...s.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i); if (dup.length) bad(r, 'duplicate ids', [...new Set(dup)].join(', '));
  for (const [, id] of s.matchAll(/href="#([^"]+)"/g)) if (!ids.includes(id) && id !== 'contact') bad(r, 'in-page link to missing #' + id);
  if (/href="#contact"/.test(s) && !ids.includes('contact') && !/data-connect=/.test(s)) bad(r, 'links to #contact but has no contact section');
}
console.log(problems ? `\n${problems} problem(s)` : '\nAll checks passed.');
process.exit(problems ? 1 : 0);
