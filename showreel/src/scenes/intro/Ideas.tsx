import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Sphere} from '../../components/Graphics';
import {easeIn, easeOut, lerp} from '../../lib/anim';
import {C, SANS, SERIF, paperBg} from '../../theme';

/**
 * "ideas into"  (global f92 – f116)
 * Concentric rings of type ("IDEAS · IDEAS ·") counter-rotate around the cobalt sphere, which
 * carries the readable word. On "into" the camera dives into the sphere until it fills the frame.
 */
const RINGS = [
  {r: 205, size: 64},
  {r: 300, size: 92},
  {r: 420, size: 118},
  {r: 560, size: 150},
  {r: 725, size: 186},
  {r: 915, size: 222},
];

export const Ideas: React.FC = () => {
  const f = useCurrentFrame();
  const dive = lerp(f, 105, 116, 1, 13, easeIn);
  const cx = 540;
  const cy = 960;
  return (
    <AbsoluteFill style={{background: paperBg, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${dive})`, transformOrigin: `${cx}px ${cy}px`}}>
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <defs>
            {RINGS.map((ring, i) => (
              <path
                key={i}
                id={`ring${i}`}
                d={`M ${cx - ring.r},${cy} a ${ring.r},${ring.r} 0 1,1 ${ring.r * 2},0 a ${ring.r},${ring.r} 0 1,1 -${ring.r * 2},0`}
              />
            ))}
          </defs>
          {RINGS.map((ring, i) => {
            const appear = lerp(f, 92 + i * 1.3, 98 + i * 1.3, 0, 1, easeOut);
            const dir = i % 2 === 0 ? 1 : -1;
            const rot = dir * (f - 92) * (3.4 - i * 0.35) + i * 37;
            const circ = 2 * Math.PI * ring.r;
            const unit = 'IDEAS · ';
            const reps = Math.max(1, Math.round(circ / (ring.size * 0.62 * unit.length)));
            return (
              <g key={i} transform={`rotate(${rot} ${cx} ${cy}) scale(${1}) `} opacity={appear}>
                <g transform={`translate(${cx} ${cy}) scale(${0.7 + 0.3 * appear}) translate(${-cx} ${-cy})`}>
                  <text
                    fontFamily={SANS}
                    fontWeight={900}
                    fontSize={ring.size}
                    fill={i === 1 ? C.cobalt : C.ink}
                    letterSpacing={-ring.size * 0.02}
                    textLength={circ - 2}
                    lengthAdjust="spacingAndGlyphs"
                  >
                    <textPath href={`#ring${i}`}>{unit.repeat(reps)}</textPath>
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
          <div style={{position: 'relative', transform: `scale(${lerp(f, 92, 97, 0.2, 1, easeOut)})`}}>
            <Sphere size={300} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: SERIF,
                fontStyle: 'italic',
                fontSize: 120,
                color: '#FFFFFF',
                paddingBottom: 14,
                opacity: lerp(f, 105, 109, 1, 0),
              }}
            >
              ideas
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
