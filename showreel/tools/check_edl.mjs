// Validates the edit decision list: contiguity, and that no shot range crosses an in-source cut.
// Usage: node tools/check_edl.mjs   (needs ffmpeg; uses scene detection, threshold 12)
import {execSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const src = readFileSync(new URL('../src/data/shots.ts', import.meta.url), 'utf8');
const rows = [...src.matchAll(/\['([\w-]+)', '([\w-]+)', ([\d.]+), ([\d.]+), (\d+), (\d+),/g)].map((m) => ({
  id: m[1], file: m[2], srcIn: +m[3], rate: +m[4], from: +m[5], dur: +m[6],
}));
const cuts = {};
let ok = true;
let prevEnd = null;
for (const r of rows) {
  if (!cuts[r.file]) {
    const out = execSync(`ffmpeg -hide_banner -i public/video/${r.file}.mp4 -vf scdet=threshold=12 -an -f null - 2>&1`).toString();
    cuts[r.file] = [...out.matchAll(/lavfi\.scd\.time: ([\d.]+)/g)].map((m) => +m[1]);
  }
  const a = Math.round(r.srcIn * 30) / 30;
  const b = a + (r.dur / 30) * r.rate;
  const hit = cuts[r.file].filter((c) => c > a + 0.001 && c < b - 0.001);
  const gap = prevEnd !== null && prevEnd !== r.from ? ` GAP/OVERLAP (prev end ${prevEnd})` : '';
  if (hit.length || gap) ok = false;
  console.log(`${r.id.padEnd(16)} f${String(r.from).padStart(3)}-${r.from + r.dur}  ${r.file.padEnd(14)} ${a.toFixed(3)}s -> ${b.toFixed(3)}s  x${r.rate}${hit.length ? '  CROSSES CUT ' + hit.join(',') : ''}${gap}`);
  prevEnd = r.from + r.dur;
}
console.log(ok ? `EDL OK: ${rows.length} shots` : 'EDL PROBLEMS FOUND');
process.exit(ok ? 0 : 1);
