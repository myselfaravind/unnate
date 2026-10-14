"""Measures each cut-out pose so the film can swap poses without the character jumping:
head centre + head width (scale reference) and the lowest orange pixel (feet anchor).
Also writes dust-free variants of the leap/fall poses (c1x, c2x)."""
import json, glob, os
import numpy as np
from PIL import Image
from scipy import ndimage
D = os.path.join(os.path.dirname(__file__), 'src/poses')

def orange(a):
    r, g, b, al = [a[..., i].astype(int) for i in range(4)]
    return (r > 150) & (r - b > 110) & (al > 140)

for n in ('c1', 'c2'):
    a = np.array(Image.open(f'{D}/{n}.png'))
    org = orange(a)
    lab, k = ndimage.label(ndimage.binary_closing(org, iterations=3))
    sizes = ndimage.sum(np.ones(org.shape), lab, range(1, k + 1))
    body = ndimage.binary_fill_holes(ndimage.binary_dilation(lab == 1 + int(np.argmax(sizes)), iterations=3))
    ys, xs = np.where(body); top, bot, l, r = ys.min(), ys.max(), xs.min(), xs.max()
    yy, xx = np.mgrid[:org.shape[0], :org.shape[1]]
    # speed lines: thin orange strokes outside the body, above (fall) or to the lower-left (leap) of it
    lines = ((a[..., 0].astype(int) - a[..., 2] > 70) & (a[..., 3] > 25) & ~body)
    if n == 'c2': lines &= yy < top + (bot - top) * .35
    else: lines &= (yy < top + (bot - top) * .82) & (xx < l + (r - l) * .5)
    keep = ndimage.gaussian_filter((body | lines).astype(float), .8)
    a = a.copy(); a[..., 3] = (a[..., 3] * np.clip(keep * 1.5, 0, 1)).astype(np.uint8)
    ys, xs = np.where(a[..., 3] > 10)
    Image.fromarray(a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]).save(f'{D}/{n}x.png')

meta = {}
for f in sorted(glob.glob(f'{D}/*.png')):
    n = os.path.basename(f)[:-4]
    a = np.array(Image.open(f).convert('RGBA'))
    m = orange(a)
    lab, k = ndimage.label(ndimage.binary_closing(m, iterations=3))
    sizes = ndimage.sum(np.ones(m.shape), lab, range(1, k + 1))
    body = lab == (1 + int(np.argmax(sizes)))
    ys, xs = np.where(body)
    top, bot = ys.min(), ys.max()
    head_rows = body[top: top + int((bot - top) * 0.42)]
    widths = head_rows.sum(axis=1)
    cols = np.where(head_rows.any(axis=0))[0]
    meta[n] = dict(w=a.shape[1], h=a.shape[0], hx=float((cols.min() + cols.max()) / 2),
                   hw=float(cols.max() - cols.min()), ht=int(top), fy=int(bot))
json.dump(meta, open(f'{D}/meta.json', 'w'), indent=1)
for n, v in meta.items(): print(n, v)
open(f'{D}/meta.js', 'w').write('window.META=' + json.dumps(meta) + ';\n')
