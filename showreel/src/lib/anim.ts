import {Easing, interpolate, random, spring} from 'remotion';
import {FPS} from '../theme';

export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const lerp = (f: number, a: number, b: number, from: number, to: number, ease: (t: number) => number = Easing.linear) =>
  interpolate(f, [a, b], [from, to], {...clamp, easing: ease});

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const snap = Easing.bezier(0.2, 0.9, 0.1, 1); // fast settle, very little tail

/** Spring progress (0 -> 1) starting at `delay`. Snappy, slight overshoot by default. */
export const pop = (frame: number, delay = 0, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  spring({frame: frame - delay, fps: FPS, config: {damping: cfg.damping ?? 14, stiffness: cfg.stiffness ?? 220, mass: cfg.mass ?? 0.6}});

/** Deterministic pseudo-random in [lo, hi). */
export const rnd = (seed: string | number, lo = 0, hi = 1) => lo + random(seed) * (hi - lo);

export const visible = (frame: number, a: number, b: number) => frame >= a && frame < b;
