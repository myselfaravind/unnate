/**
 * Portfolio edit decision list.
 *
 * Every entry is a short excerpt with a verified source in-point (seconds, source time) and playback
 * rate; the out-point is derived: srcOut = srcIn + (durationInFrames / 30) * rate. All sources were
 * inspected end-to-end (contact sheets at 2 fps, then 6 fps strips around each candidate). In-points sit
 * at least 2 source frames clear of any in-source cut, so no frame of a neighbouring shot leaks in.
 *
 * Sources (all 720x1280 @ 24 fps unless noted):
 *   hero-gorilla.mp4   hf_20260903_112333_…mp4   (20.0 s)
 *   solara.mp4         SOLARA Drink's.mp4        (15.1 s)
 *   crave-build.mp4    hf_20260816_153454_…mp4   (20.1 s)
 *   crave-ad.mp4       Crave Burger's AD.mp4     (20.1 s)
 *   kid-animation.mp4  hf_20260815_144442_…mp4   (15.1 s)
 *   fox-landscape.mp4  hf_20260815_170723_…mp4   (8.1 s, 1280x720 landscape)
 *   restaurant.mp4     Restaurant.mp4            (20.1 s)
 *   neuva.mp4          NEUVA Biwali.mp4          (20.1 s)
 *   pearl-medspa.mp4   Pearl MedSpa.mp4          (20.1 s)
 * Not used: Crave Burger's.mp4 (office spot) — its strongest moments (sauce macro, reaction) duplicate
 * the two other Crave films, which are stronger.
 */

export type Framing =
  | {kind: 'fill'; scaleFrom?: number; scaleTo?: number; originX?: number; originY?: number}
  // landscape source: a 9:16 window that pans between source-x centres (source pixels)
  | {kind: 'crop916'; srcW: number; srcH: number; centerFrom: number; centerTo: number; zoomFrom?: number; zoomTo?: number; centerY?: number};

export type Shot = {
  id: string;
  src: string;
  srcIn: number; // seconds, source timeline
  rate: number;
  from: number; // composition frame
  dur: number; // frames
  framing: Framing;
  grade?: string; // CSS filter, only where a correction helped
  note: string;
};

const fill: Framing = {kind: 'fill'};

// [id, src, srcIn, rate, from, dur, framing, grade, note]
const rows: Array<[string, string, number, number, number, number, Framing, string | undefined, string]> = [
  // --- 1. Opener: scale + impact (bars 1–2)
  ['gorilla-stomp', 'hero-gorilla', 0.0, 1.0, 190, 25, fill, undefined, 'giant foot lands, dust — opens inside the folder, lands on the drop'],
  ['gorilla-charge', 'hero-gorilla', 4.92, 1.3, 215, 15, fill, undefined, 'gorilla charges camera'],
  ['gorilla-splash', 'hero-gorilla', 6.05, 1.4, 230, 15, fill, undefined, 'white splash bursts — match-cuts to juice splash'],
  ['solara-splash', 'solara', 9.65, 1.3, 245, 23, fill, 'saturate(1.06) contrast(1.04)', 'juice explosion, bottle tumbling'],
  ['solara-implode', 'solara', 11.85, 1.2, 268, 15, fill, 'saturate(1.06) contrast(1.04)', 'splash collapses into the bottle'],
  ['solara-ring', 'solara', 5.0, 1.6, 283, 30, fill, 'saturate(1.06) contrast(1.04)', 'label peels into an orbiting fruit ring'],
  ['gorilla-spiral', 'hero-gorilla', 14.62, 1.5, 313, 22, fill, undefined, 'ring motion match: batter spirals around the gorilla'],
  // --- 2. Food rhythm, cut on 8ths (bars 3–4)
  ['build-knife', 'crave-build', 2.12, 1.3, 335, 8, {kind: 'fill', scaleFrom: 1.06, scaleTo: 1.0}, undefined, 'knife slices the bun'],
  ['build-ketchup', 'crave-build', 4.1, 1.4, 343, 13, fill, undefined, 'sauce pour'],
  ['build-cheese', 'crave-build', 8.95, 1.5, 356, 10, fill, undefined, 'cheese slice lands'],
  ['build-toppings', 'crave-build', 10.2, 1.9, 366, 14, fill, undefined, 'lettuce, pickle, onion ring drop in'],
  ['build-drizzle', 'crave-build', 12.9, 1.6, 380, 15, fill, undefined, 'mayo + hot sauce drizzle'],
  ['ad-lid', 'crave-ad', 13.0, 1.3, 395, 15, fill, undefined, 'box lid lifts — product reveal'],
  ['ad-bite', 'crave-ad', 15.3, 1.4, 410, 15, fill, undefined, 'the bite'],
  ['ad-reaction', 'crave-ad', 16.92, 1.3, 425, 15, fill, undefined, 'eyes pop, then the grin'],
  // --- 3. Breathe: character + story (bars 5–6)
  ['kid-door', 'kid-animation', 0.1, 1.4, 440, 22, {kind: 'fill', scaleFrom: 1.0, scaleTo: 1.08, originY: 0.6}, undefined, 'backlit walk through the doors'],
  ['kid-whip', 'kid-animation', 8.2, 1.45, 462, 30, fill, undefined, 'surprise -> in-camera whip pan -> new character'],
  ['fox', 'fox-landscape', 0.7, 1.2, 492, 22, {kind: 'crop916', srcW: 1280, srcH: 720, centerFrom: 648, centerTo: 640, zoomFrom: 1.0, zoomTo: 1.06, centerY: 0.42}, undefined, 'landscape source: 9:16 window kept on the fox head'],
  ['pasta-rack', 'restaurant', 1.55, 1.6, 514, 18, fill, undefined, 'pasta plate, focus pulls to the guest'],
  ['pasta-bite', 'restaurant', 11.9, 1.2, 532, 13, fill, undefined, 'fork to mouth'],
  ['pasta-savour', 'restaurant', 13.3, 1.3, 545, 15, fill, undefined, 'eyes close, savouring'],
  // --- 4. Product + people, then finale (bars 7–8)
  ['neuva-open', 'neuva', 6.08, 1.7, 560, 15, fill, undefined, 'gift box opened — lands on the re-drop'],
  ['neuva-dates', 'neuva', 7.08, 1.2, 575, 8, fill, undefined, 'macro: dates'],
  ['neuva-sweet', 'neuva', 7.56, 1.2, 583, 7, fill, undefined, 'macro: sweet'],
  ['neuva-apricot', 'neuva', 8.06, 1.0, 590, 8, fill, undefined, 'macro: apricots'],
  ['neuva-jar', 'neuva', 9.0, 1.1, 598, 7, fill, undefined, 'macro: branded jar'],
  ['neuva-team', 'neuva', 15.32, 1.15, 605, 15, fill, undefined, 'team reacts to the gift'],
  ['pearl-glow', 'pearl-medspa', 11.4, 1.5, 620, 15, fill, 'contrast(1.07) saturate(1.05)', 'treatment device glow'],
  ['pearl-walk', 'pearl-medspa', 15.45, 1.6, 635, 20, fill, 'contrast(1.07) saturate(1.05)', 'confident walk to camera'],
  ['gorilla-launch', 'hero-gorilla', 17.36, 1.2, 655, 40, fill, undefined, 'finale: gorilla launched skyward, temple revealed'],
];

export const SHOTS: Shot[] = rows.map(([id, src, srcIn, rate, from, dur, framing, grade, note]) => ({
  id,
  src: `video/${src}.mp4`,
  srcIn,
  rate,
  from,
  dur,
  framing,
  grade,
  note,
}));

export const srcOut = (s: Shot) => s.srcIn + (s.dur / 30) * s.rate;
