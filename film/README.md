# UNNATE.COM — brand film (9:16, 24 s)

A code-driven motion piece: `src/film.js` lays out every frame as a pure function of time, headless
Chromium screenshots each frame, ffmpeg encodes. The character is the supplied Action Sheet art
(cut out by `poses.py`), the logo is the site's own vector wordmark (`src/wordmark.svg`), and the
mid-film work is the real portfolio (screenshots, creatives, video frames).

    npm run build        # media cache → poses → soundtrack → 720 frames → out/unnate-brand-film.mp4
    node render.mjs --stills 4.3,19.5   # quick look at individual moments (build/stills)

`out/` and `build/` are not committed — the MP4 is larger than Cloudflare Pages' 25 MiB file limit.
