"""Converts the PNGs from tools/capture/devices.mjs into the site's WebP assets.

Usage: python3 tools/capture/to_webp.py OUT_DIR
Phone screens become 600 px wide (iPhone 15 ratio, 393:852); desktop heroes 1200 px wide.
Run from the repository root. Prints each file written with its size, which the
page markup's width and height attributes must match.
"""
import os
import sys

from PIL import Image

DEST = {
    'tradie-hero': 'assets/work/demos/tradie-hero.webp',
    'tradie-phone': 'assets/work/demos/tradie-phone.webp',
    'tracker-phone': 'assets/work/demos/tracker-phone.webp',
    'ops-phone': 'assets/work/demos/ops-phone.webp',
    'maren-hero': 'assets/work/sites/maren-hero.webp',
    'maren-phone': 'assets/work/sites/maren-phone.webp',
}


def main(src_dir):
    for name, dest in DEST.items():
        path = os.path.join(src_dir, name + '.png')
        if not os.path.exists(path):
            continue
        im = Image.open(path).convert('RGB')
        width = 600 if name.endswith('-phone') else 1200
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        im.save(dest, 'WEBP', quality=82, method=6)
        print(f'{dest} {im.width}x{im.height} {os.path.getsize(dest) // 1024} KB')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'capture-out')
