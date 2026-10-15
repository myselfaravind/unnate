import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Caret, Sphere} from '../components/Graphics';
import {easeOut, lerp, pop} from '../lib/anim';
import {C, SANS, paperBg} from '../theme';
import {T} from '../data/timeline';

/**
 * Sign-off (global f695 – f740): hard cut from the finale back to the paper world of the intro.
 * The name drops in letter by letter on the final hit; the sphere rolls in as the full stop.
 * No logo, no agency branding — just the name.
 */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const s = T.outro;
  return (
    <AbsoluteFill style={{background: paperBg, justifyContent: 'center', alignItems: 'center', overflow: 'hidden'}}>
      <div style={{display: 'flex', alignItems: 'flex-end'}}>
        {'ARAVIND'.split('').map((ch, i) => {
          const p = pop(f, s + i * 1.2, {damping: 12, stiffness: 300});
          return (
            <div key={i} style={{overflow: 'hidden', height: 214}}>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: 236,
                  lineHeight: 0.9,
                  letterSpacing: '-0.045em',
                  color: C.ink,
                  transform: `translateY(${(1 - p) * -240}px) scaleY(${lerp(f, s + i * 1.2 + 3, s + i * 1.2 + 8, 1.25, 1, easeOut)})`,
                  transformOrigin: '50% 100%',
                }}
              >
                {ch}
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginLeft: 10,
            marginBottom: 6,
            transform: `translateX(${(1 - pop(f, s + 9, {damping: 13, stiffness: 180})) * 700}px) rotate(${(1 - pop(f, s + 9, {damping: 13, stiffness: 180})) * 400}deg)`,
          }}
        >
          <Sphere size={58} />
        </div>
      </div>
      <Caret frame={f - s} height={8} width={120} color={C.cobalt} style={{position: 'absolute', top: 1110, left: 480, opacity: f > s + 14 ? undefined : 0}} />
    </AbsoluteFill>
  );
};
