# Portfolio files

Put the real work here, then fill the matching slot in `index.html` → search for `const WORK = {`.
Nothing appears on the site until a slot has a file. Once any real work exists, empty slots are hidden automatically.

| Work | Folder | Slot fields in WORK |
|---|---|---|
| Website demo (live) | `portfolio/websites/project-01/index.html` (+ its own css/js/images) | `preview:'portfolio/websites/project-01/index.html'` |
| Website demo (image only) | `portfolio/websites/project-01/full.webp` — a full-page capture | `screenshot:'portfolio/websites/project-01/full.webp'` |
| Creative | `portfolio/creatives/creative-01.webp` | `src:'portfolio/creatives/creative-01.webp'`, `alt:'…'` |
| Short-form video | `portfolio/short-form/video-01.mp4` + `video-01.jpg` (poster) | `src:'…mp4'`, `poster:'…jpg'` |

Every slot also takes `title`, `description` (one line) and `kind` — use `'concept'` for demo/self-initiated work
(labelled "Concept · Self-initiated") and `'client'` only for work done for a paying client.

Recommended formats
- Images: WebP (or JPG), long edge ≤ 2000px, ~200–400 KB. Keep the original aspect ratio; nothing is cropped.
- Video: MP4 (H.264 + AAC), 1080×1920, ≤ 8–12 MB each; a JPG poster from the first strong frame.
- Website demos that must stay on another server: use `preview:'https://…'` only if that site allows being framed;
  otherwise supply a `screenshot` instead (shown honestly as a "full-page capture").
