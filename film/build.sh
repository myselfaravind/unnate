#!/usr/bin/env bash
# Full pipeline: media cache → poses → soundtrack → frames → MP4.
set -euo pipefail
cd "$(dirname "$0")"
[ -d node_modules ] || npm i --silent
[ -f build/media/crave/001.jpg ] || { node shoot-sites.mjs; ./prep-media.sh; }
python3 poses.py >/dev/null
python3 sound.py
rm -rf build/frames && node render.mjs
mkdir -p out
ffmpeg -v error -y -framerate 30 -i build/frames/%04d.jpg -i build/audio.wav \
  -c:v libx264 -preset slow -crf 21 -maxrate 12M -bufsize 24M -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 192k -af "loudnorm=I=-14:TP=-1.5:LRA=11" -shortest out/unnate-brand-film.mp4
ls -la out/unnate-brand-film.mp4
