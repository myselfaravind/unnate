# Portfolio — how to add real work

Section 03 is driven by **portfolio/portfolio.js**. Static hosting can't list a folder, so each piece is named there once.
All paths are relative to the site root, so they work locally, on GitHub and on Cloudflare.

| Work | Put the files here | Entry in portfolio.js |
|---|---|---|
| Website (a real HTML site) | `portfolio/websites/<project>/index.html` + its own css/js/images/fonts | `{ id, title, type:'web', label, tag, src:'portfolio/websites/<project>/index.html' }` |
| Creative | `portfolio/creatives/<file>.webp` (or .jpg/.png) | `{ id, title, type:'creative', label, tag, src:'portfolio/creatives/<file>.webp', alt:'what it shows' }` |
| Short-form video | `portfolio/videos/<file>.mp4` + `<file>.jpg` poster | `{ id, title, type:'video', label, tag, src:'portfolio/videos/<file>.mp4', poster:'portfolio/videos/<file>.jpg' }` |

- **Websites** render live in the gallery (a scaled desktop view; on phones the site's own mobile layout) and open fully interactive.
  Keep each site self-contained in its folder with *relative* links (`css/style.css`, not `/css/style.css` or `C:\...`).
- **Creatives** keep their own proportions — nothing is cropped.
- **Videos** show the poster and only download when someone hovers (mouse) or opens them (touch). MP4 (H.264/AAC), ≤ 1080×1920, ideally ≤ 10 MB.
- `featured: true` also places a piece in **All works**. `tag` keeps labelling honest ('Client work', 'Concept', 'Self-initiated').
- Remove the built-in `demo:` entries as real pieces replace them.
