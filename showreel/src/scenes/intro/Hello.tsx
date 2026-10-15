import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caret, Selection, Sphere} from '../../components/Graphics';
import {easeIn, easeOut, lerp, pop} from '../../lib/anim';
import {C, SANS, SERIF, paperBg} from '../../theme';

/**
 * "Hello there,"  (global f0 – f36)
 * Letters fly in from beyond every edge and lock into one word; the O is a cobalt sphere (object
 * replacing a letter). "there" is drag-selected. Exit: letters stretch away vertically while the
 * sphere swells to fill the frame and becomes the background of the name scene.
 */
const LETTERS: Array<{ch: string; x: number; y: number; r: number}> = [
  {ch: 'H', x: -760, y: -1100, r: -48},
  {ch: 'E', x: 980, y: -520, r: 34},
  {ch: 'L', x: -120, y: 1250, r: 96},
  {ch: 'L', x: -980, y: 420, r: -70},
];

export const Hello: React.FC = () => {
  const f = useCurrentFrame();
  const FONT = 300;

  // exit: f24 -> f36
  const stretch = lerp(f, 23, 31, 1, 7, easeIn);
  const sphereGrow = lerp(f, 22, 35, 1, 16, easeIn);

  return (
    <AbsoluteFill style={{background: paperBg, overflow: 'hidden'}}>
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', transform: 'translateY(-90px)'}}>
          {LETTERS.map((l, i) => {
            const p = pop(f + 4, i * 1.5, {damping: 13, stiffness: 260});
            const land = lerp(f, 6 + i * 1.5, 11 + i * 1.5, 1.22, 1, easeOut); // squash on landing
            const dir = i % 2 === 0 ? -1 : 1;
            return (
              <div
                key={i}
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: FONT,
                  lineHeight: 1,
                  letterSpacing: '-0.02em',
                  color: C.ink,
                  marginRight: -FONT * 0.035,
                  transform: `translate(${l.x * (1 - p)}px, ${l.y * (1 - p) + dir * (stretch - 1) * 160}px) rotate(${l.r * (1 - p)}deg) scale(${1 / land}, ${land * stretch})`,
                  opacity: lerp(f, 28, 33, 1, 0),
                }}
              >
                {l.ch}
              </div>
            );
          })}
          {/* the O */}
          {(() => {
            const p = pop(f + 4, 6, {damping: 12, stiffness: 200});
            return (
              <div
                style={{
                  marginLeft: FONT * 0.02,
                  transform: `translate(${1100 * (1 - p)}px, ${260 * (1 - p)}px) rotate(${-540 * (1 - p)}deg) scale(${sphereGrow})`,
                  zIndex: 2,
                }}
              >
                <Sphere size={FONT * 0.74} />
              </div>
            );
          })()}
        </div>
      </AbsoluteFill>

      {/* "there," — selected like text in an editor */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div
          style={{
            transform: `translate(${110 + lerp(f, 22, 30, 0, 0)}px, ${150 + lerp(f, 22, 30, 0, 700, easeIn)}px)`,
            opacity: f >= 13 ? 1 : 0,
          }}
        >
          <Selection progress={lerp(f, 14, 21, 0, 1, easeOut)} width={360} height={150}>
            <div style={{display: 'flex', alignItems: 'center', height: 150}}>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 150, lineHeight: 1, color: C.ink, paddingLeft: 14}}>there,</div>
              <Caret frame={f} height={120} color={C.ink} width={5} style={{marginLeft: 8}} />
            </div>
          </Selection>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
