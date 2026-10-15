"""
Original soundtrack, synthesised to the edit (no samples, no third-party audio).

Direction: dark, cinematic electronic — controlled sub, punchy kick, snare+clap, crisp hats,
detuned "reese" bass, dark pads, filtered synth stabs, risers/impacts only at structural moments.
F minor, 120 BPM (1 beat = 15 frames @ 30 fps), downbeat grid anchored to frame 200 (reel start).

Structure (frames):
  0–172    atmosphere under the VO: pad swell, sub heartbeat, soft kick from f66, hats from f114
  172–196  build under "Here's what I do": snare 8ths -> 16ths, rising filter, riser
  197–199  near silence (the breath before the reveal)
  200      DROP: impact + full groove (first shot lands full frame)
  425–440  snare fill
  440–530  breakdown (no kick): open pad, bass, half-time hats
  530–558  build, 558–559 breath, 560 re-drop
  655      finale accent
  695      final hit, groove stops, tail resolves to f740

Usage: python make_music.py <out.wav>
"""
import sys
import wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
FPS = 30
TOTAL_FRAMES = 740
DROP_F, FILL_F, BREAK_F, BUILD2_F, REDROP_F, FINALE_F, OUTRO_F = 200, 425, 440, 530, 560, 655, 695
BEAT = 0.5
T = TOTAL_FRAMES / FPS
N = int(T * SR)
rng = np.random.default_rng(2026)


def f2s(f):
    return f / FPS


def bt(k):
    return f2s(DROP_F) + k * BEAT


def lp(x, fc, o=2):
    return sosfilt(butter(o, min(fc, SR / 2 - 100), "low", fs=SR, output="sos"), x)


def hp(x, fc, o=2):
    return sosfilt(butter(o, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, min(hi, SR / 2 - 100)], "band", fs=SR, output="sos"), x)


def place(buf, sig, t, g=1.0):
    i = int(round(t * SR))
    if i >= len(buf):
        return
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * g


def ex(n, d):
    return np.exp(-np.arange(n) / SR / d)


def saw(f, n, ph=0.0):
    return 2.0 * ((np.arange(n) / SR * f + ph) % 1.0) - 1.0


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ------------------------------------------------------------------ instruments
def kick(soft=False):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 47 + 150 * np.exp(-t / 0.028)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * ex(n, 0.1 if soft else 0.15)
    click = hp(rng.normal(0, 1, n), 3000) * ex(n, 0.003) * (0.15 if soft else 0.45)
    return np.tanh((body + click) * 2.2) * 0.85


def snare():
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * 190 * t) * ex(n, 0.05) * 0.5
    noise = bp(rng.normal(0, 1, n), 1600, 10000) * ex(n, 0.13) * 0.9
    clap = np.zeros(n)
    for off in (0.0, 0.009, 0.018):
        i = int(off * SR)
        clap[i:] += ex(n - i, 0.01)
    clap = bp(rng.normal(0, 1, n), 1000, 6000) * (clap * 0.5 + ex(n, 0.09) * 0.4)
    return np.tanh((tone + noise + clap * 0.6) * 1.5) * 0.6


def hat(open_=False):
    n = int((0.22 if open_ else 0.04) * SR)
    s = hp(rng.normal(0, 1, n), 8500, 4)
    return s * ex(n, 0.07 if open_ else 0.011) * (0.2 if open_ else 0.17)


def sub(m, dur):
    n = int(dur * SR)
    f = midi(m)
    s = np.sin(2 * np.pi * f * np.arange(n) / SR)
    a = np.minimum(1, np.arange(n) / (0.006 * SR))
    r = np.minimum(1, (n - np.arange(n)) / (0.03 * SR))
    return np.tanh(s * 1.6) * a * r * 0.55


def reese(m, dur, cutoff=650):
    n = int(dur * SR)
    f = midi(m)
    s = saw(f * 0.993, n) + saw(f * 1.007, n, 0.37) + 0.5 * saw(f * 2.0, n, 0.1)
    s = lp(s, cutoff, 4)
    a = np.minimum(1, np.arange(n) / (0.005 * SR))
    r = np.minimum(1, (n - np.arange(n)) / (0.02 * SR))
    return np.tanh(s * 0.9) * a * r * 0.32


def pad(ms, dur, cutoff, attack=0.4):
    n = int((dur + 0.45) * SR)  # tail overlaps the next chord: no gaps at bar lines
    s = np.zeros(n)
    for m in ms:
        for d, p in ((-0.006, 0.0), (0.0, 0.31), (0.006, 0.62)):
            s += saw(midi(m) * (1 + d), n, p)
    s = lp(s / (len(ms) * 3), cutoff, 2)
    a = np.minimum(1, np.arange(n) / (attack * SR))
    r = np.minimum(1, (n - np.arange(n)) / (0.45 * SR))
    return s * a * r


def stab(ms, dur=0.45, peak=3600):
    """Filtered saw chord stab with a falling filter envelope (brassy, not plucky)."""
    n = int(dur * SR)
    s = np.zeros(n)
    for m in ms:
        s += saw(midi(m) * 0.997, n) + saw(midi(m) * 1.003, n, 0.5)
    s /= len(ms) * 2
    out = np.zeros(n)
    blocks = 24
    for b in range(blocks):
        i0, i1 = b * n // blocks, (b + 1) * n // blocks
        fc = 500 + peak * np.exp(-(i0 / SR) / 0.09)
        seg = lp(s[max(0, i0 - 1500):i1], fc, 2)
        out[i0:i1] = seg[-(i1 - i0):]
    return out * np.minimum(1, np.arange(n) / (0.004 * SR)) * ex(n, 0.22)


def riser(dur):
    n = int(dur * SR)
    x = np.arange(n) / n
    noise = rng.normal(0, 1, n)
    out = np.zeros(n)
    blocks = 60
    for b in range(blocks):
        i0, i1 = b * n // blocks, (b + 1) * n // blocks
        fc = 400 + 9000 * (b / blocks) ** 2.2
        seg = bp(noise[max(0, i0 - 3000):i1], fc * 0.6, fc * 1.5)
        out[i0:i1] = seg[-(i1 - i0):]
    tone = np.sin(2 * np.pi * np.cumsum(110 + 440 * x ** 2) / SR) * 0.12
    return (out * 0.55 + tone) * x ** 2.5


def reverse_swell(dur):
    n = int(dur * SR)
    s = hp(rng.normal(0, 1, n), 2500) * ex(n, dur / 3)
    return s[::-1] * 0.35


def impact(big=1.0):
    n = int(2.6 * SR)
    t = np.arange(n) / SR
    f = 34 + 90 * np.exp(-t / 0.05)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * ex(n, 0.7 * big)
    air = hp(rng.normal(0, 1, n), 4500) * ex(n, 0.35) * 0.12
    return np.tanh((boom * 1.3 + air) * 1.4) * 0.75


def reverb(x, secs, mix, damp=5000):
    n = int(secs * SR)
    ir = lp(rng.normal(0, 1, n) * ex(n, secs / 5), damp)
    ir /= np.sqrt(np.sum(ir ** 2))
    return x * (1 - mix) + fftconvolve(x, ir)[: len(x)] * mix


# ------------------------------------------------------------------ arrangement
drums, bass, keys, fx = (np.zeros(N) for _ in range(4))
side = np.ones(N)


def duck(t, depth=0.7, rel=0.24):
    i, n = int(t * SR), int(rel * SR)
    j = min(N, i + n)
    if 0 <= i < N:
        side[i:j] = np.minimum(side[i:j], 1 - depth * np.exp(-np.arange(j - i) / (0.33 * n)))


# F minor: Fm – Db – Ab – Eb   (i – VI – III – VII)
PROG = [(41, [53, 56, 60]), (37, [49, 53, 56]), (44, [56, 60, 63]), (39, [51, 55, 58])]
HAT_VEL = [0.55, 0.3, 1.0, 0.35]

k0 = int(np.floor(-f2s(DROP_F) / BEAT))
k1 = int(np.ceil((T - f2s(DROP_F)) / BEAT))
for k in range(k0, k1):
    t = bt(k)
    if t < 0 or t >= T:
        continue
    f = t * FPS
    bar, bib = (k // 4) % 4, k % 4
    root, ch = PROG[bar]

    if f >= OUTRO_F:
        continue
    if f < DROP_F:  # ---------------- intro under the voice
        if bib == 0:
            place(keys, pad(ch, BEAT * 4, 500 + 1400 * (max(f, 0) / DROP_F), attack=0.25), t, 0.3)
        if bib in (0, 2):
            place(drums, kick(soft=True), t, 0.35 if f < 66 else 0.55)
            place(bass, sub(root, 0.32), t, 0.4)
            duck(t, 0.3)
        if f >= 114:
            place(drums, hat(), t + BEAT / 2, 0.8)
        if 172 <= f < 196:  # build
            pr = (f - 172) / 24
            div = 2 if pr < 0.5 else 4
            for s in range(div):
                ts = t + s * BEAT / div
                if ts * FPS < 196.5:
                    place(drums, hp(snare(), 300 + 1500 * pr), ts, 0.25 + 0.45 * pr)
        continue

    if BREAK_F <= f < BUILD2_F:  # ---------------- breakdown
        if bib == 0:
            place(keys, pad(ch + [ch[0] + 12], BEAT * 4, 2200, attack=0.1), t, 0.6)
            place(bass, reese(root, BEAT * 4 + 0.02, 420), t, 0.7)
            place(bass, sub(root, BEAT * 4 + 0.02), t, 0.45)
        if bib == 2:
            place(drums, snare(), t, 0.35)
        place(drums, hat(), t + BEAT / 2, 0.7)
        continue

    if BUILD2_F <= f < REDROP_F:  # ---------------- build 2
        pr = (f - BUILD2_F) / (REDROP_F - BUILD2_F)
        div = 2 if pr < 0.5 else 4
        for s in range(div):
            ts = t + s * BEAT / div
            if ts * FPS < REDROP_F - 1.5:
                place(drums, hp(snare(), 300 + 1800 * pr), ts, 0.3 + 0.5 * pr)
        if bib == 0:
            place(keys, pad(ch, BEAT * 4, 1500 + 3000 * pr, attack=0.05), t, 0.6)
        place(bass, sub(root, BEAT * 0.9), t, 0.5)
        continue

    # ---------------- full groove (bars after the drops)
    place(drums, kick(), t, 1.0)
    duck(t, 0.75)
    if bib in (1, 3):
        place(drums, snare(), t, 0.85)
    for s in range(4):
        place(drums, hat(open_=(s == 2)), t + s * BEAT / 4, HAT_VEL[s] * (1.0 if f >= REDROP_F or s != 1 else 0.6))
    if FILL_F <= f < BREAK_F:  # snare fill into the breakdown
        for s in range(4):
            place(drums, snare(), t + s * BEAT / 4, 0.25 + 0.12 * s)
    # bass: sub on the beat, reese on the off-beat 8th + a 16th push
    place(bass, sub(root, BEAT * 0.95), t, 0.85)
    place(bass, reese(root, BEAT * 0.38, 1700 if f >= REDROP_F else 1300), t + BEAT / 2, 0.9)
    if bib == 3:
        place(bass, reese(root + 12, BEAT * 0.2, 1100), t + BEAT * 0.75, 0.7)
    if bib == 0:
        place(keys, pad(ch + [ch[0] + 12], BEAT * 4, 2600, attack=0.08), t, 0.45)
        if bar % 2 == 0:
            place(keys, stab([m + 12 for m in ch]), t, 0.5)
    if bib == 2 and bar % 2 == 1:
        place(keys, stab([m + 12 for m in ch], 0.3, 2400), t + BEAT / 2, 0.32)

# ---------------- transitions & accents (sparse)
place(fx, riser(f2s(196 - 140)), f2s(140), 0.6)            # under "visuals… stand out… here's what I do"
place(fx, reverse_swell(0.9), f2s(197) - 0.9, 0.8)
place(fx, impact(1.0), f2s(DROP_F), 0.95)                 # the drop / first full-frame shot
place(keys, stab([m + 12 for m in PROG[0][1]] + [PROG[0][1][0]], 0.9, 4200), f2s(DROP_F), 0.6)
place(fx, riser(f2s(REDROP_F - 2 - BUILD2_F)), f2s(BUILD2_F), 0.5)
place(fx, impact(0.8), f2s(REDROP_F), 0.6)
place(fx, reverse_swell(0.7), f2s(FINALE_F) - 0.7, 0.5)
place(fx, impact(0.9), f2s(FINALE_F), 0.45)
# outro: final hit + resolving chord tail (Fm with added 9th)
place(drums, kick(), f2s(OUTRO_F), 1.0)
place(fx, impact(1.3), f2s(OUTRO_F), 0.85)
place(bass, sub(29, 1.45), f2s(OUTRO_F), 0.9)
place(keys, stab([65, 68, 72, 79], 1.2, 3000), f2s(OUTRO_F), 0.7)
place(keys, pad([53, 56, 60, 67], f2s(TOTAL_FRAMES - OUTRO_F), 1600, attack=0.02), f2s(OUTRO_F), 0.6)

# ---------------- mix
keys = reverb(keys * (0.35 + 0.65 * side), 2.2, 0.32)
bass = lp(bass * side, 5000)
drums = reverb(drums, 0.8, 0.1, 7000)
fx = reverb(fx, 2.4, 0.3)
mix = drums * 0.9 + bass * 0.5 + keys * 1.9 + fx * 0.7

# breath before each reveal: near-silence for the last frames before the drop / re-drop
for g0, g1 in ((197, 200), (558.5, 560)):
    i0, i1 = int(f2s(g0) * SR), int(f2s(g1) * SR)
    ramp = int(0.012 * SR)
    mix[i0:i0 + ramp] *= np.linspace(1, 0.04, ramp)
    mix[i0 + ramp:i1] *= 0.04

mix = hp(mix, 30)
mix = mix + 0.4 * hp(mix, 2500) - 0.22 * lp(mix, 90)  # bus EQ: presence up, sub tamed
mix = np.tanh(mix * 1.25) / np.tanh(1.25)
fs = int(f2s(TOTAL_FRAMES - 24) * SR)
mix[fs:] *= np.linspace(1, 0, N - fs) ** 2
mix /= np.max(np.abs(mix)) / 0.89

stereo = np.stack([mix, mix], axis=1)
d = int(0.011 * SR)
stereo[d:, 1] = 0.82 * stereo[d:, 1] + 0.18 * mix[:-d]
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(stereo, -1, 1) * 32767).astype(np.int16).tobytes())
print("wrote", sys.argv[1], f"{T:.2f}s")
