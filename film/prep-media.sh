#!/usr/bin/env bash
# Builds the film's media cache from the real portfolio (frames + resized stills).
set -euo pipefail
cd "$(dirname "$0")"
R=..; M=build/media
mkdir -p "$M/crave" "$M/solara"
ffmpeg -v error -y -ss 14.0 -t 2.2 -i "$R/portfolio/videos/Crave Burger's AD.mp4" -vf "fps=30,scale=540:960" -q:v 3 "$M/crave/%03d.jpg"
ffmpeg -v error -y -ss 9.0 -t 4.4 -i "$R/portfolio/videos/SOLARA Drink's.mp4" -vf "fps=30,scale=540:960" -q:v 3 "$M/solara/%03d.jpg"
for f in "$R"/portfolio/creatives/*.png; do
  n=$(basename "$f" .png | tr 'A-Z' 'a-z' | tr -cd 'a-z0-9 ' | tr ' ' '-')
  ffmpeg -v error -y -i "$f" -vf "scale=720:-2" -q:v 3 "$M/cr-$n.jpg"
done
for v in "Crave Burger's AD:14.6" "NEUVA:12" "Pearl MedSpa:1.5" "NEUVA Biwali:17" "SOLARA Drink's:3"; do
  n=${v%%:*}; t=${v##*:}; s=$(echo "$n" | tr 'A-Z' 'a-z' | tr -cd 'a-z ' | tr ' ' '-')
  ffmpeg -v error -y -ss "$t" -i "$R/portfolio/videos/$n.mp4" -frames:v 1 -vf "scale=540:-2" -q:v 3 "$M/still-$s.jpg"
done
cp "$R"/assets/img/{shot-home,shot-mob,shot-svc,cloud-bank,cloud-puff,cloud-small}.webp "$M/"
ls "$M" | head -40
