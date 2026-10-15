# Aravind — intro + portfolio showreel (Remotion)

Vertical 1080 × 1920, 30 fps, 24.67 s (740 frames), H.264 High (yuv420p) + AAC 48 kHz stereo.

- **0 – 6.6 s — intro.** Kinetic typography driven by the supplied voice-over.
- **6.67 – 23.2 s — showreel.** 30 excerpts cut from 9 of the 10 portfolio films.
- **23.2 – 24.7 s — sign-off.** The name only. No logos or agency branding.

```
npm install
npm run build          # remotion render -> out/master.mp4, then ffmpeg -> out/aravind-showreel.mp4 (limited-range yuv420p, faststart)
npm run studio         # edit / scrub in Remotion Studio
node tools/check_edl.mjs   # verifies every excerpt is contiguous and never crosses an in-source cut
```

**Source films are not committed.** The repository's policy is that portfolio originals stay off git (see the root
`.gitignore` / `ASSETS.md`), and this repo is deployed as-is by Cloudflare Pages, which would publish them and rejects
files over 25 MiB. Put the nine films into `public/video/` under the names below before rendering.

| `public/video/` name | Original upload |
|---|---|
| `hero-gorilla.mp4` | `hf_20260903_112333_1ccb197d-31fc-4550-ba5d-06bb070549b6.mp4` |
| `solara.mp4` | `SOLARA Drink's.mp4` |
| `crave-build.mp4` | `hf_20260816_153454_3f007339-13cd-41ff-90eb-0711b89a3580.mp4` |
| `crave-ad.mp4` | `Crave Burger's AD.mp4` |
| `kid-animation.mp4` | `hf_20260815_144442_cc3e8526-f942-44e9-8b94-9306fa4cc5e9.mp4` |
| `fox-landscape.mp4` | `hf_20260815_170723_fbfb186f-d866-4fc2-8933-d2934941df79.mp4` (1280×720) |
| `restaurant.mp4` | `Restaurant.mp4` |
| `neuva.mp4` | `NEUVA Biwali.mp4` |
| `pearl-medspa.mp4` | `Pearl MedSpa.mp4` |

`Crave Burger's.mp4` (the office spot) was inspected and left out. Its best moments, the sauce macro and the
reaction, repeat what the two stronger Crave films already show.

## Project layout

```
src/
  Showreel.tsx            master timeline: intro scenes, 30 shots, sign-off, grain, audio mix
  data/timeline.ts        VO word timings + scene boundaries (frames)
  data/shots.ts           edit decision list (source, in-point, rate, timeline slot, framing, grade)
  components/ClipShot.tsx one excerpt: trimBefore + playbackRate, per-shot framing (fill / 9:16 window on 16:9)
  components/Graphics.tsx sphere, caret, selection highlight, folder, cursor
  components/Grain.tsx    deterministic grain (8 tiles, seeded offsets)
  scenes/intro/*.tsx      Hello, Name (portrait), Turn, Creative, Ideas, Visuals, That, StandOut, Silence, Folders
  scenes/Outro.tsx
tools/make_music.py       synthesises the placeholder music bed to the cut (see "Music" below)
tools/make_grain.py       grain tiles
tools/check_edl.mjs       EDL validator
public/                   fonts (Inter Tight + Instrument Serif, SIL OFL), portrait + cut-out, VO, music bed, grain
```

## Intro: voice-over → motion

Word timings come from forced alignment (pocketsphinx), cross-checked against the recording's loudness envelope.
The VO starts at frame 4, so the first frame is already moving.

| Frames | Words | On screen |
|---|---|---|
| 0–36 | "Hello there," | HELLO flies in from beyond every edge, and a cobalt sphere replaces the O. "there," is drag-selected. The letters stretch away while the sphere swells to fill the frame. |
| 34–66 | "I'm **Aravind**" | Cobalt field with the name in three counter-moving rows. **The portrait is visible f40–f63 (0.80 s), aligned to the spoken name (f40–f57).** It wipes in with two silhouette echoes, drifts with parallax, and paper bands remove it. |
| 64–78 | "I turn" | Each letter of TURN flips over, then the whole word turns 90°. |
| 78–92 | "creative" | Mixed grotesk and italic-serif letters collide into a dense stack, and the sphere becomes the dot of the I. A hard horizontal stretch exits. |
| 92–114 | "ideas into" | Concentric, counter-rotating rings of IDEAS. On "into" the camera dives into the sphere. |
| 114–133 | "visuals" | Giant letters act as windows onto real portfolio footage, which changes on the beat. |
| 133–139 | "that" | One small word in empty space. |
| 139–163 | "stand out." | A crowd of grey STANDs fills the frame and one turns black and lifts. A cobalt OUT bursts out and shoves the crowd aside. |
| 163–172 | (pause) | Negative space: a blinking caret. |
| 172–200 | "Here's what I do." | Folders fly in, and a cursor double-clicks the big one. It opens, and the first shot expands out of it to full frame on the downbeat (f200). |

## Showreel edit decision list (source times in seconds)

Out-points are computed as `in + (frames / 30) × rate`. All sources are 24 fps; the rates gently speed up the
slow-moving AI footage. In-points sit at least two source frames clear of any in-source cut.

| # | Timeline (frames) | Source | In → Out (s) | Rate | Moment |
|---|---|---|---|---|---|
| 1 | 194–215 | hero-gorilla | 0.000 → 0.700 | 1.0 | Giant foot lands. Starts inside the folder. |
| 2 | 215–230 | hero-gorilla | 4.933 → 5.583 | 1.3 | Gorilla charges the camera |
| 3 | 230–245 | hero-gorilla | 6.067 → 6.767 | 1.4 | White splash, which match-cuts to the next shot |
| 4 | 245–268 | solara | 9.667 → 10.663 | 1.3 | Juice explosion |
| 5 | 268–283 | solara | 11.867 → 12.467 | 1.2 | Splash implodes into the bottle |
| 6 | 283–313 | solara | 5.000 → 6.600 | 1.6 | Label peels into an orbiting fruit ring |
| 7 | 313–335 | hero-gorilla | 14.633 → 15.733 | 1.5 | Batter spiral, a ring-motion match |
| 8 | 335–343 | crave-build | 2.133 → 2.480 | 1.3 | Knife through the bun |
| 9 | 343–356 | crave-build | 4.100 → 4.707 | 1.4 | Sauce pour |
| 10 | 356–366 | crave-build | 8.967 → 9.467 | 1.5 | Cheese lands |
| 11 | 366–380 | crave-build | 10.200 → 11.087 | 1.9 | Lettuce, pickle and onion drop |
| 12 | 380–395 | crave-build | 12.900 → 13.700 | 1.6 | Mayo and hot-sauce drizzle |
| 13 | 395–410 | crave-ad | 13.000 → 13.650 | 1.3 | Box lid lifts (product reveal) |
| 14 | 410–425 | crave-ad | 15.300 → 16.000 | 1.4 | The bite |
| 15 | 425–440 | crave-ad | 16.933 → 17.583 | 1.3 | Eyes pop, then a grin |
| 16 | 440–462 | kid-animation | 0.100 → 1.127 | 1.4 | Backlit walk through the doors (slow push-in) |
| 17 | 462–492 | kid-animation | 8.200 → 9.650 | 1.45 | Surprise, then an in-camera whip to a new character |
| 18 | 492–514 | fox-landscape | 0.700 → 1.580 | 1.2 | 16:9 source: a 9:16 window held on the fox's head |
| 19 | 514–532 | restaurant | 1.567 → 2.527 | 1.6 | Pasta plate as focus pulls to the guest |
| 20 | 532–545 | restaurant | 11.900 → 12.420 | 1.2 | Fork to mouth |
| 21 | 545–560 | restaurant | 13.300 → 13.950 | 1.3 | Eyes close, savouring |
| 22 | 560–575 | neuva | 6.067 → 6.917 | 1.7 | Gift box opened, on the second drop |
| 23 | 575–583 | neuva | 7.067 → 7.387 | 1.2 | Macro: dates |
| 24 | 583–590 | neuva | 7.567 → 7.847 | 1.2 | Macro: sweet |
| 25 | 590–598 | neuva | 8.067 → 8.333 | 1.0 | Macro: apricots |
| 26 | 598–605 | neuva | 9.000 → 9.257 | 1.1 | Macro: branded jar |
| 27 | 605–620 | neuva | 15.333 → 15.908 | 1.15 | Team reacts to the gift |
| 28 | 620–635 | pearl-medspa | 11.400 → 12.150 | 1.5 | Treatment-device glow |
| 29 | 635–655 | pearl-medspa | 15.467 → 16.533 | 1.6 | Confident walk to camera |
| 30 | 655–695 | hero-gorilla | 17.367 → 18.967 | 1.2 | Finale: gorilla launched skyward, temple revealed |

Inside the VISUALS letters (intro, f114–133):
- solara 9.70 s (×1.2, 7 frames)
- crave-build 13.00 s (×1.3, 6 frames)
- hero-gorilla 10.85 s (×1.3, 7 frames)

**Framing.**
- The 9:16 sources map 1:1 to the canvas (720×1280 → 1080×1920, ×1.5). None is stretched or blindly cropped.
- The one landscape source, the fox, is shown through a 9:16 window centred on the fox's head (x ≈ 640 of 1280), with a 6 % push.
- Its upscale (2.67×) is soft at 100 % zoom but holds at phone size.

**Grade.** Restrained, and applied only where it helped:
- solara: `saturate(1.06) contrast(1.04)`
- pearl-medspa: `contrast(1.07) saturate(1.05)`, because the source is flat beige
- everything else: untouched, to keep each film's own colour identity

## Audio

- **Voice-over.** The supplied ElevenLabs file, unedited, at +1 dB. It starts at f4.
- **Music.** **No music file was supplied** (the upload held the VO, the reference and the portfolio zips only). The
  bed in `public/audio/music-bed.wav` is original and synthesised by `tools/make_music.py`, with no samples or third-party audio.
  - It runs at 120 BPM, so one beat is 15 frames, with the downbeat locked to f200 where the reel starts.
  - Sections:
    - **Intro (under the VO):** soft pulse, about 12 dB below the voice
    - **f200 drop:** full groove
    - **f440 breakdown:** human-story section
    - **f530 build**
    - **f560 second drop:** onto the NEUVA box opening
    - **f655 finale impact**
    - **f695 final hit and tail**
  - **To use your own track:** put it in `public/audio/` and change `MUSIC_SRC` in `src/data/timeline.ts`. The
    ducking curve is in `src/Showreel.tsx`. Then retime the f200 and f560 cuts to its accents if needed.
- **Source audio.** All original clip audio is muted, because those films carry their own VO and music.
- **Final mix.** −16.0 LUFS integrated, −3.1 dBTP. The reel section sits around −14 LUFS short-term.

## Motion-reference techniques used

From `motion_reference.mp4`:
- **An object replacing a letter.** The reference uses i + can = "i can't"; here a sphere is the O of HELLO and the dot of the I in CREATIVE, and closes the name.
- **Mixed-typeface letter collisions.** "any thing" in the reference; CREATIVE here.
- **OS selection highlight with handles.** "focus" in the reference; "there," here.
- **Radial type rings around a central object.** "I cannot focus" in the reference; IDEAS here.
- **Grid or crowd density resolving to one emphasised word.** STAND → OUT.
- **Swarms of interface folders.** The reference's blue folders become the transition into the work.
- **Hard compositional cuts with negative-space beats.** "that" and the caret pause.

The reference video itself is not used anywhere in the output.
