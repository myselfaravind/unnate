import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Sphere} from '../../components/Graphics';
import {easeIn, easeOut, lerp, pop, rnd} from '../../lib/anim';
import {C, SANS, SERIF, paperBg} from '../../theme';

/**
 * "I turn"  (global f64 – f80)
 * Each letter of TURN flips over on its own axis, then the whole word turns 90° and scales up
 * until its strokes become black bars that wipe into the next layout.
 */
export const Turn: React.FC = () => {
  const f = useCurrentFrame();
  const spin = lerp(f, 74, 78, 0, 90, easeIn);
  const grow = lerp(f, 74, 78, 1, 1.9, easeIn);
  return (
    <AbsoluteFill style={{background: paperBg, overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute',
          left: 92,
          top: 560,
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 230,
          lineHeight: 1,
          color: C.cobalt,
          transform: `translateY(${lerp(f, 65, 70, 60, 0, easeOut)}px)`,
          opacity: lerp(f, 65, 67, 0, 1) * lerp(f, 74, 76, 1, 0),
        }}
      >
        I
      </div>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', transform: `rotate(${spin}deg) scale(${grow})`, perspective: 900}}>
          {'TURN'.split('').map((ch, i) => {
            const p = pop(f, 65 + i * 1.3, {damping: 13, stiffness: 300});
            return (
              <div
                key={i}
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 360,
                  lineHeight: 0.9,
                  letterSpacing: '-0.03em',
                  color: C.ink,
                  marginRight: -10,
                  transform: `rotate(${(1 - p) * (i % 2 ? 180 : -180)}deg) rotateY(${(1 - p) * 90}deg) scale(${0.4 + 0.6 * p})`,
                  opacity: p > 0.02 ? 1 : 0,
                }}
              >
                {ch}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * "creative"  (global f78 – f94)
 * Letters collide in from off-frame and lock into a dense two-line stack that mixes the grotesk
 * and the italic serif. A sphere drops in as the dot over the I; exit is a hard
 * horizontal stretch past the frame edges.
 */
const CREATIVE: Array<{ch: string; serif?: boolean; italic?: boolean; ml?: number}> = [
  {ch: 'C'},
  {ch: 'r', serif: true},
  {ch: 'E'},
  {ch: 'A', italic: true},
  {ch: 't', serif: true},
  {ch: 'I'},
  {ch: 'v', serif: true, ml: 58},
  {ch: 'E'},
];

export const Creative: React.FC = () => {
  const f = useCurrentFrame();
  const sx = lerp(f, 89, 94, 1, 3.4, easeIn);
  const lines = [CREATIVE.slice(0, 4), CREATIVE.slice(4)];
  return (
    <AbsoluteFill style={{background: paperBg, overflow: 'hidden'}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scaleX(${sx})`}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -40}}>
          {lines.map((line, li) => (
            <div key={li} style={{display: 'flex', alignItems: 'baseline', height: 360, marginLeft: li === 1 ? 110 : -10}}>
              {line.map((l, i) => {
                const idx = li * 4 + i;
                const d = 74 + idx * 0.7;
                const p = pop(f, d, {damping: 17, stiffness: 420});
                const ang = rnd(`cr-a${idx}`, 0, Math.PI * 2);
                const dist = 1250;
                const settle = rnd(`cr-r${idx}`, -6, 6);
                return (
                  <div
                    key={i}
                    style={{
                      fontFamily: l.serif ? SERIF : SANS,
                      fontWeight: l.serif ? 400 : 900,
                      fontStyle: l.serif || l.italic ? 'italic' : 'normal',
                      fontSize: l.serif ? 470 : 400,
                      lineHeight: 0.9,
                      color: l.serif ? C.cobalt : C.ink,
                      position: 'relative',
                      marginRight: l.serif ? -2 : -14,
                      marginLeft: l.ml ?? 0,
                      transform: `translate(${Math.cos(ang) * dist * (1 - p)}px, ${Math.sin(ang) * dist * (1 - p)}px) rotate(${settle + (1 - p) * rnd(`cr-s${idx}`, -200, 200)}deg)`,
                    }}
                  >
                    {l.ch}
                    {l.ch === 'I' ? (
                      <div style={{position: 'absolute', left: '50%', top: -70, transform: `translateX(-50%) scale(${pop(f, 82, {damping: 9, stiffness: 320})})`}}>
                        <Sphere size={120} />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
