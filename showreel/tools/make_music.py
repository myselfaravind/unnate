"""
Original music bed for the showreel, synthesised to the edit (no samples, no third-party audio).

Why this exists: the brief asked for a supplied music track, but no music file was uploaded
(only the voice-over). This generates a placeholder bed whose structure is locked to the
cut list in src/data/timeline.ts. Drop your own track into public/audio/ and point
MUSIC_SRC in src/data/timeline.ts at it to replace this.

120 BPM -> one beat = 15 frames at 30 fps. The downbeat grid is anchored to frame 200,
the first frame of the portfolio section.

Usage: python make_music.py <out.wav>
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
FPS = 30
TOTAL_FRAMES = 740
DROP_F = 200          # portfolio starts / first downbeat
BREAK_F = 440         # breakdown (human-story section)
BUILD_F = 530         # build back up
REDROP_F = 560        # second drop
FINALE_F = 655        # finale impact
OUTRO_F = 695         # final hit, beat stops
BEAT = 0.5            # seconds (120 BPM)

T = TOTAL_FRAMES / FPS + 0.0
N = int(T * SR)
rng = np.random.default_rng(1234)


def f2s(f):
    return f / FPS


def beat_time(k):
    return f2s(DROP_F) + k * BEAT


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def place(buf, sig, t, gain=1.0):
    i = int(round(t * SR))
    if i >= len(buf):
        return
    if i < 0:
        sig = sig[-i:]
        i = 0
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[: j - i] * gain


def env_exp(n, decay):
    t = np.arange(n) / SR
    return np.exp(-t / decay)


def saw(freq, n, phase=0.0):
    t = np.arange(n) / SR
    return 2.0 * ((t * freq + phase) % 1.0) - 1.0


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------------------------------------------------------- instruments
def kick(strength=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 44 + 110 * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * env_exp(n, 0.16 * strength)
    click = hp(rng.normal(0, 1, n), 2500) * env_exp(n, 0.004) * 0.35
    return np.tanh((body + click) * 1.6) * 0.9


def clap():
    n = int(0.35 * SR)
    noise = bp(rng.normal(0, 1, n), 900, 5200)
    e = np.zeros(n)
    for off in (0.0, 0.011, 0.022):
        i = int(off * SR)
        e[i:] += env_exp(n - i, 0.012 if off < 0.02 else 0.11)
    return noise * e * 0.55


def hat(open_=False):
    n = int((0.16 if open_ else 0.05) * SR)
    s = hp(rng.normal(0, 1, n), 7000, 4)
    return s * env_exp(n, 0.055 if open_ else 0.012) * (0.22 if open_ else 0.16)


def tick():
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * 2400 * t) * env_exp(n, 0.008) * 0.25


def bass_note(m, dur):
    n = int(dur * SR)
    f = midi(m)
    s = 0.55 * saw(f, n) + 0.45 * saw(f * 1.004, n, 0.3)
    s = lp(s, 380, 2)
    sub = np.sin(2 * np.pi * f * np.arange(n) / SR)
    e = np.minimum(1, np.arange(n) / (0.004 * SR)) * env_exp(n, dur * 0.9)
    return np.tanh((0.7 * s + 0.6 * sub) * 1.4) * e * 0.5


def chord_tone(ms, dur, cutoff, attack=0.005, decay=None):
    n = int(dur * SR)
    s = np.zeros(n)
    for m in ms:
        f = midi(m)
        for d, p in ((0.0, 0.0), (0.006, 0.33), (-0.007, 0.66)):
            s += saw(f * (1 + d), n, p)
    s /= len(ms) * 3
    s = lp(s, cutoff, 2)
    a = np.minimum(1, np.arange(n) / (attack * SR))
    e = a * (env_exp(n, decay) if decay else np.minimum(1, (n - np.arange(n)) / (0.05 * SR)))
    return s * e


def pluck(m, dur=0.22):
    n = int(dur * SR)
    f = midi(m)
    t = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + saw(f * 2, n) * 0.3
    s = lp(s, 3200, 2)
    return s * env_exp(n, 0.07) * 0.22


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = t / dur
    noise = rng.normal(0, 1, n)
    out = np.zeros(n)
    blocks = 48
    for b in range(blocks):
        i0, i1 = b * n // blocks, (b + 1) * n // blocks
        fc = 300 + 7000 * (b / blocks) ** 2
        seg = bp(noise[max(0, i0 - 2000):i1], fc * 0.7, min(fc * 1.4, 20000))
        out[i0:i1] = seg[-(i1 - i0):]
    tone = np.sin(2 * np.pi * np.cumsum(180 + 900 * x ** 2) / SR) * 0.15
    return (out * 0.5 + tone) * x ** 2.2


def impact(big=1.0):
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = 38 + 80 * np.exp(-t / 0.06)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_exp(n, 0.55 * big)
    crash = hp(rng.normal(0, 1, n), 3000) * env_exp(n, 0.5) * 0.18
    return np.tanh((boom * 1.2 + crash) * 1.3) * 0.8


# reverb (simple exponential-noise IR)
def reverb(x, secs=1.3, mix=0.25):
    n = int(secs * SR)
    ir = rng.normal(0, 1, n) * env_exp(n, secs / 5)
    ir = lp(ir, 6000)
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = fftconvolve(x, ir)[: len(x)]
    return x * (1 - mix) + wet * mix


# ---------------------------------------------------------------- arrangement
drums = np.zeros(N)
bass = np.zeros(N)
keys = np.zeros(N)
fx = np.zeros(N)

# progression per bar (4 beats): Am - F - C - G   (A minor, bright-ish)
PROG = [
    (45, [57, 60, 64, 69]),   # Am
    (41, [53, 57, 60, 65]),   # F
    (48, [55, 60, 64, 67]),   # C
    (43, [55, 59, 62, 67]),   # G
]
ARP = [0, 2, 1, 3, 2, 1, 3, 2]

first_k = int(np.floor((0 - f2s(DROP_F)) / BEAT))
last_k = int(np.ceil((T - f2s(DROP_F)) / BEAT))

side = np.ones(N)  # sidechain envelope driven by kicks


def duck(t, depth=0.6, rel=0.22):
    i = int(t * SR)
    n = int(rel * SR)
    j = min(N, i + n)
    if i >= N or j <= 0:
        return
    curve = 1 - depth * np.exp(-np.arange(j - i) / (0.35 * n))
    side[i:j] = np.minimum(side[i:j], curve)


for k in range(first_k, last_k):
    t = beat_time(k)
    if t < 0 or t >= T:
        continue
    f = t * FPS
    bar = (k // 4) % 4
    beat_in_bar = k % 4
    root, ch = PROG[bar]

    intro = f < DROP_F - 1
    breakdown = BREAK_F <= f < REDROP_F
    build = BUILD_F <= f < REDROP_F
    after_outro = f >= OUTRO_F

    if after_outro:
        continue

    if intro:
        # soft pulse under the voice: sub thump + ticking hats, no clap
        place(drums, kick(0.6), t, 0.32)
        duck(t, 0.25)
        place(drums, hat(), t + BEAT / 2, 0.55)
        if beat_in_bar == 0:
            place(keys, chord_tone(ch, BEAT * 4, 900, attack=0.25), t, 0.42)
        continue

    if breakdown and not build:
        # breakdown: no kick, filtered chords + arp, light hats
        if beat_in_bar == 0:
            place(keys, chord_tone(ch, BEAT * 4, 1600, attack=0.12), t, 0.75)
        if beat_in_bar in (0, 2):
            place(drums, kick(0.7), t, 0.55)
            duck(t, 0.35)
        place(drums, hat(), t + BEAT / 2, 0.75)
        for s in range(2):
            place(keys, pluck(ch[ARP[(k * 2 + s) % 8] % len(ch)] + 12), t + s * BEAT / 2, 1.35)
        place(bass, bass_note(root, BEAT * 0.9), t, 0.55)
        continue

    if build:
        # build: 8ths -> 16ths snare roll, rising filter
        prog_ = (f - BUILD_F) / (REDROP_F - BUILD_F)
        div = 2 if prog_ < 0.5 else 4
        for s in range(div):
            place(drums, clap(), t + s * BEAT / div, 0.25 + 0.5 * prog_)
        place(keys, chord_tone(ch, BEAT, 1200 + 5000 * prog_, attack=0.01, decay=0.3), t, 0.5)
        place(bass, bass_note(root, BEAT * 0.45), t, 0.6)
        continue

    # full groove
    place(drums, kick(), t, 1.0)
    duck(t, 0.65)
    if beat_in_bar in (1, 3):
        place(drums, clap(), t, 0.9)
    place(drums, hat(open_=True), t + BEAT / 2, 1.0)
    for s in (1, 3):
        place(drums, hat(), t + s * BEAT / 4, 0.9)
    # bass: off-beat 8ths with octave jump
    place(bass, bass_note(root, BEAT * 0.42), t + BEAT / 2, 0.9)
    place(bass, bass_note(root + (12 if beat_in_bar == 3 else 0), BEAT * 0.3), t, 0.55)
    # chord stabs on the off-beat
    place(keys, chord_tone([m + 12 for m in ch[:3]], 0.18, 3800, decay=0.09), t + BEAT / 2, 0.55)
    # arp 16ths in second half of each section
    for s in range(4):
        place(keys, pluck(ch[ARP[(k * 4 + s) % 8] % len(ch)] + 12), t + s * BEAT / 4, 0.75)

# --- accents (sparse, only on structural moments of the intro + edit)
for fr in (0, 39, 66, 114, 153, 186):
    place(fx, tick(), f2s(fr), 0.7)
place(fx, riser(f2s(DROP_F) - 5.15), 5.15, 0.55)                      # into the reel
place(fx, impact(1.0), f2s(DROP_F), 0.9)                              # the drop
place(fx, riser(f2s(REDROP_F - BUILD_F)), f2s(BUILD_F), 0.5)          # into re-drop
place(fx, impact(0.8), f2s(REDROP_F), 0.6)
place(fx, impact(1.2), f2s(FINALE_F), 0.65)                           # finale shot
# outro: final chord hit + long tail
_, ch_end = PROG[0]
place(keys, chord_tone([m + 12 for m in ch_end] + [ch_end[0]], 1.4, 2600, decay=0.55), f2s(OUTRO_F), 0.9)
place(bass, bass_note(33, 1.2), f2s(OUTRO_F), 1.0)
place(fx, impact(1.4), f2s(OUTRO_F), 0.8)

# --------------------------------------------------------------- mix
keys = reverb(keys * side, 1.6, 0.3)
bass = bass * side
drums = reverb(drums, 0.9, 0.12)
fx = reverb(fx, 2.0, 0.3)
mix = drums * 0.85 + bass * 0.8 + keys * 0.7 + fx * 0.8

# gentle bus EQ + soft clip + fade tail
mix = hp(mix, 28)
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
fade = np.ones(N)
fs = int(f2s(TOTAL_FRAMES - 18) * SR)
fade[fs:] = np.linspace(1, 0, N - fs) ** 1.5
mix *= fade
mix /= np.max(np.abs(mix)) / 0.89   # ~ -1 dBFS peak

stereo = np.stack([mix, mix], axis=1)
# small stereo width on keys/hats via Haas
d = int(0.012 * SR)
stereo[d:, 1] = 0.85 * stereo[d:, 1] + 0.15 * mix[:-d]

import wave
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((np.clip(stereo, -1, 1) * 32767).astype(np.int16).tobytes())
print("wrote", sys.argv[1], f"{T:.2f}s")
