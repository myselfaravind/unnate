"""Sound design for the UNNATE.COM film — every cue is placed on the same timeline as film.js.
Synthesised from scratch (no samples), written to build/audio.wav (48 kHz stereo, 24 s)."""
import os
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
from scipy.io import wavfile

SR, DUR = 48000, 24.0
N = int(SR * DUR)
L = np.zeros(N); Rch = np.zeros(N)
rs = np.random.RandomState(7)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(sig)] += sig * l * 1.414
    Rch[i:i + len(sig)] += sig * r * 1.414


def env(n, a=0.005, d=0.2, curve=4.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-curve * np.maximum(0, t - a) / max(d, 1e-4))
    return e


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def sweep_noise(dur, f0, f1, q=1.2, shape=None):
    """Noise through a band-pass whose centre glides f0→f1 (processed in short blocks)."""
    n = int(dur * SR); x = rs.randn(n); out = np.zeros(n); B = 512
    for s in range(0, n, B):
        p = s / n; fc = f0 * (f1 / f0) ** p; bw = fc / q
        lo, hi = max(30, fc - bw / 2), min(SR / 2 - 100, fc + bw / 2)
        out[s:s + B] = bp(x[max(0, s - 2048):s + B], lo, hi)[-len(x[s:s + B]):]
    t = np.linspace(0, 1, n)
    e = shape(t) if shape else np.sin(np.pi * t) ** 1.5
    return out * e / (np.abs(out).max() + 1e-9)


def whoosh(t0, dur, f0, f1, gain=.5, pan=0, shape=None):
    add(sweep_noise(dur, f0, f1, 1.4, shape), t0, gain, pan)


def boom(t0, gain=1.0, f0=95, f1=32, dur=1.4):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 7)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6)
    click = hp(rs.randn(n), 2000) * np.exp(-t * 90) * .5
    body = lp(rs.randn(n), 900) * np.exp(-t * 9) * 1.4
    crunch = bp(rs.randn(n), 1800, 5000) * np.exp(-t * 16) * .35
    add(np.tanh(1.6 * (sub + click + body + crunch)) * .9, t0, gain)


def thud(t0, gain=.5, f=70):
    n = int(.45 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(f + 60 * np.exp(-t * 30)) / SR) * np.exp(-t * 9)
    s += lp(rs.randn(n), 500) * np.exp(-t * 25) * .5
    add(s, t0, gain)


def tick(t0, gain=.25, f=2600, pan=0, dec=70):
    n = int(.06 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * dec) + hp(rs.randn(n), 4000) * np.exp(-t * 200) * .3
    add(s, t0, gain, pan)


def pop(t0, gain=.35, f0=420, f1=900, pan=0):
    n = int(.14 * SR); t = np.arange(n) / SR
    f = f0 + (f1 - f0) * (1 - np.exp(-t * 40))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 28)
    add(s, t0, gain, pan)


def snap(t0, gain=.7):
    n = int(.25 * SR); t = np.arange(n) / SR
    s = hp(rs.randn(n), 1500) * np.exp(-t * 60) + np.sin(2 * np.pi * 1150 * t) * np.exp(-t * 45) * .6
    s += np.sin(2 * np.pi * np.cumsum(140 * np.exp(-t * 12) + 50) / SR) * np.exp(-t * 14) * .8
    add(np.tanh(2 * s), t0, gain)


def stretch(t0, dur=.18, f0=160, f1=330, gain=.18, pan=0):
    n = int(dur * SR); t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur) * (1 + .03 * np.sin(2 * np.pi * 28 * t))
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1) - 1
    s = bp(saw, 300, 1600) * np.sin(np.pi * t / dur) ** .7
    add(s, t0, gain, pan)


def tap(t0, gain=.12, pan=0):
    n = int(.05 * SR); t = np.arange(n) / SR
    add(lp(rs.randn(n), 1400) * np.exp(-t * 90) + np.sin(2 * np.pi * 180 * t) * np.exp(-t * 60), t0, gain, pan)


def ping(t0, gain=.2, f=1760):
    n = int(1.2 * SR); t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6)) * np.exp(-t * 3.5)
    add(s, t0, gain)


def pluck(t0, freq, dur=.6, gain=.12, pan=0):
    n = int(dur * SR); p = max(2, int(SR / freq))
    buf = rs.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = .5 * (buf[i % p] + buf[(i + 1) % p]) * .996
    add(lp(out, 3500) * np.exp(-np.arange(n) / SR * 3), t0, gain, pan)


def kick(t0, gain=.55):
    n = int(.42 * SR); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t * 32)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + hp(rs.randn(n), 3000) * np.exp(-t * 300) * .15
    add(np.tanh(1.5 * s), t0, gain)


def hat(t0, gain=.06, pan=.2):
    n = int(.07 * SR); t = np.arange(n) / SR
    add(hp(rs.randn(n), 7000) * np.exp(-t * 70), t0, gain, pan)


def clap(t0, gain=.14):
    n = int(.25 * SR); t = np.arange(n) / SR
    e = sum(np.exp(-np.maximum(0, t - d) * 60) * (t >= d) for d in (0, .011, .022)) + np.exp(-t * 14) * .4
    add(bp(rs.randn(n), 900, 3000) * e, t0, gain)


def bass(t0, f, dur, gain=.22):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + .25 * np.sin(2 * np.pi * 2 * f * t)
    e = np.minimum(1, t / .01) * np.exp(-t * 2.2)
    add(lp(np.tanh(1.3 * s), 400) * e, t0, gain)


def pad(t0, freqs, dur, gain=.08, att=.6):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for det in (-.004, 0, .005):
            ph = np.cumsum(np.full(n, f * (1 + det))) / SR
            s += 2 * (ph % 1) - 1
    s = lp(s, 1600) / (len(freqs) * 3)
    e = np.minimum(1, t / att) * np.minimum(1, (dur - t) / 1.2)
    add(s * e, t0, gain, -.15); add(s * e, t0 + .013, gain * .8, .25)


# ------------------------------------------------------------------ HOOK + PROBLEM (0–5 s)
whoosh(0.0, .4, 500, 2600, .55, shape=lambda p: p ** 1.6)
boom(.38, 1.0)
for i in range(14): tick(.42 + rs.rand() * .7, .07 + rs.rand() * .06, 900 + rs.rand() * 2400, rs.uniform(-.8, .8), 120)
whoosh(1.0, .9, 300, 160, .16)
pad(1.3, [55, 82.4], 3.8, .07, att=1.2)                  # dull, airless drone: the sameness
thud(1.85, .35, 62)
tick(2.75, .12, 1300)
for i in range(7): tick(2.95 + i * .055, .1, 700 + i * 90, -.3 + i * .1, 50)
stretch(3.55, .15, 150, 240, .16); stretch(3.72, .15, 180, 290, .18); stretch(3.88, .32, 200, 380, .22)
snap(4.24, .85)
whoosh(4.24, .78, 900, 3200, .4, pan=.3)
for i in range(5): tick(4.28 + i * .05, .09, 1500 + i * 220, .1 * i, 60)

# ------------------------------------------------------------------ TRANSFORMATION (5–10 s)
thud(5.0, .55, 75); ping(5.0, .1, 1320)
for i in range(46):                                         # the flip wave
    tt = 5.0 + (i / 46) ** 1.3 * 1.15
    tick(tt, .05 + .04 * rs.rand(), 1900 + rs.rand() * 1600, rs.uniform(-.9, .9), 90)
for k in range(7): tap(5.58 + k * .083, .07)
whoosh(5.85, 1.4, 180, 1400, .42, shape=lambda p: np.sin(np.pi * p) ** 2)
for k in range(8): tap(7.3 + k * .083, .09, -.4 + k * .1)
stretch(7.95, .12, 140, 200, .14)
whoosh(8.08, .3, 600, 2200, .22)
thud(8.55, .55, 60); stretch(8.58, .45, 330, 120, .22)
whoosh(9.1, .55, 2500, 500, .28, shape=lambda p: np.exp(-p * 4) * np.minimum(1, p * 30))
pop(9.97, .3, 300, 700)
for i in range(8): pop(10.0 + .05 + i * .035, .16, 500 + 60 * i, 1000 + 80 * i, -.8 + i * .2)
whoosh(10.0, .4, 500, 1800, .16)
for k in range(9): tap(10.52 + k * .083, .07, -.6 + k * .15)

# ------------------------------------------------------------------ PEAK (10.8–16 s)
whoosh(10.78, .3, 1200, 3500, .18, pan=.2)
whoosh(11.0, .8, 140, 2000, .5, shape=lambda p: p ** 2 * (1 - p) * 6.75)
whoosh(12.3, .3, 3000, 700, .3, pan=-.2)
whoosh(12.6, .8, 2400, 300, .3)
for i in range(5): whoosh(13.5 + i * .06, .45, 700, 2600, .14, pan=-.8 + i * .4)
whoosh(14.25, .9, 400, 2400, .3, pan=-.6)
for i in range(7): tick(15.95 + i * .07, .1, 900 + i * 110, -.6 + i * .2, 45)
for i in range(8): ping(16.2 + i * .08, .035, 1760 * 2 ** (i % 4 / 12 * 3))
thud(16.1, .25, 70)

# ------------------------------------------------------------------ the beat (5.0 → 18.2)
BPM = 120; beat = 60 / BPM
notes = [55.0, 43.65, 65.41, 49.0]                         # A1  F1  C2  G1
ARP = [440, 523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25]
t = 5.0; b = 0
while t < 18.2:
    kick(t, .5 if t > 7 else .38)
    if b % 2 == 1 and t > 7: clap(t, .12)
    hat(t + beat / 2, .05 if t < 9 else .08)
    if t > 11: hat(t + beat * .75, .035, -.3)
    if b % 2 == 0: bass(t, notes[(b // 8) % 4], beat * 1.9, .2)
    if t > 9: pluck(t, ARP[b % 8] / (1 if t > 13 else 2), .45, .055 + .02 * (t > 13), (-.5 if b % 2 else .5))
    t += beat; b += 1
whoosh(16.8, 1.45, 300, 6000, .24, shape=lambda p: p ** 3)  # riser into the implosion

# ------------------------------------------------------------------ REVELATION → BRAND (18–24 s)
whoosh(18.02, .3, 800, 3000, .2)
whoosh(18.2, .55, 4000, 120, .5, shape=lambda p: p ** 2.5)   # everything sucked to a point
pop(18.6, .45, 160, 380)
for k, tt in enumerate((19.05, 19.16, 19.3)): tick(tt, .1 - k * .02, 1100, .3, 60)
whoosh(19.02, .33, 600, 3000, .45, shape=lambda p: p ** 1.5)
boom(19.35, 1.15, 110, 30, 2.2)
thud(19.4, .4, 55)
whoosh(19.72, .5, 700, 1800, .18)
tap(20.25, .2)
for i in range(3): pop(20.27 + i * .06, .3, 380 + i * 120, 800 + i * 160, .2 + .2 * i)
ping(20.42, .16, 2093)
pad(19.4, [110, 164.81, 220, 277.18, 329.63, 493.88], 4.6, .1, att=.25)   # A major add9 — resolution
pad(20.9, [55, 82.41], 3.1, .06, att=.8)

# ------------------------------------------------------------------ master
mix = np.stack([L, Rch], 1)
mix = hp(mix.T, 25).T
mix = np.tanh(mix * 1.1) * .9
fade = np.minimum(1, (N - np.arange(N)) / (SR * .35))[:, None]
mix *= fade
mix /= np.abs(mix).max() / .89
os.makedirs(os.path.join(os.path.dirname(__file__), 'build'), exist_ok=True)
wavfile.write(os.path.join(os.path.dirname(__file__), 'build/audio.wav'), SR, (mix * 32767).astype(np.int16))
print('audio ok', mix.shape)
