"""Generates 8 deterministic grain tiles (mid-grey noise) used by <Grain/>."""
import sys
import numpy as np
from PIL import Image, ImageFilter
out = sys.argv[1]
rng = np.random.default_rng(7)
for i in range(8):
    n = rng.normal(0, 1, (512, 512))
    im = Image.fromarray(np.clip(128 + n * 46, 0, 255).astype(np.uint8), "L")
    im = im.filter(ImageFilter.GaussianBlur(0.55))
    a = np.asarray(im).astype(float)
    a = 128 + (a - a.mean()) * (46 / max(a.std(), 1))
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), "L").save(f"{out}/grain-{i}.png", optimize=True)
