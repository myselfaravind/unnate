import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {T} from '../../data/timeline';
import {easeIn, easeInOut, easeOut, lerp, pop} from '../../lib/anim';
import {C, SANS, SERIF, cobaltBg} from '../../theme';

/**
 * "I'm Aravind."  (global f34 – f66)
 * Cobalt field (the sphere from the previous scene). The name is set huge across the top in three
 * counter-moving rows; the illustrated portrait is wiped up from the bottom with two offset
 * silhouette echoes that collapse into register, drifts with light parallax, and is removed by
 * three paper-coloured bands at f60–65. Portrait on screen f39–f65 (~0.87 s), spoken name f40–f57.
 */
const NAME = 'ARAVIND';

const PW = 1000; // portrait display width (source 1086x1448)
const PH = PW * (1448 / 1086);

export const Name: React.FC = () => {
  const f = useCurrentFrame();

  // --- portrait reveal / parallax
  const reveal = lerp(f, T.portraitIn, T.portraitIn + 6, 0, 1, easeOut);
  const lift = lerp(f, T.portraitIn, T.portraitIn + 7, 150, 0, easeOut) + lerp(f, 46, 64, 0, -26, easeInOut);
  const scale = lerp(f, T.portraitIn, T.portraitIn + 7, 1.14, 1, easeOut) * lerp(f, 46, 64, 1, 1.03);
  const rot = lerp(f, T.portraitIn, T.portraitIn + 8, -5, 0, easeOut);
  const echo = lerp(f, T.portraitIn, T.portraitIn + 8, 1, 0, easeOut);
  const portraitOn = f >= T.portraitIn && f <= T.portraitOut;

  const portraitBox: React.CSSProperties = {
    position: 'absolute',
    left: (1080 - PW) / 2 + 30,
    top: 1920 - PH + 40,
    width: PW,
    height: PH,
  };

  const portraitImg = (filter: string | undefined, dx: number, dy: number, opacity = 1) => (
    <Img
      src={staticFile('img/aravind-cutout.png')}
      style={{
        ...portraitBox,
        filter,
        opacity,
        transform: `translate(${dx}px, ${lift + dy}px) rotate(${rot}deg) scale(${scale})`,
        transformOrigin: '50% 100%',
        clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)`,
      }}
    />
  );

  // --- name rows
  const row = (y: number, speed: number, solid: boolean, delay: number, size: number) => {
    const drift = (f - 34) * speed;
    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: y,
          width: 1080,
          display: 'flex',
          justifyContent: 'center',
          transform: `translateX(${drift}px)`,
        }}
      >
        {NAME.split('').map((ch, i) => {
          const p = pop(f, 39 + delay + i * 1.6, {damping: 15, stiffness: 300});
          return (
            <div key={i} style={{overflow: 'hidden', height: size * 0.86, marginRight: -size * 0.04}}>
              <div
                style={{
                  fontFamily: SANS,
                  fontWeight: 900,
                  fontSize: size,
                  lineHeight: 0.86,
                  color: solid ? C.paper : 'transparent',
                  WebkitTextStroke: solid ? undefined : `3px ${C.paper}`,
                  transform: `translateY(${(1 - p) * size * 0.9}px)`,
                }}
              >
                {ch}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // --- exit bands (paper) f60 -> f65
  const bands = [0, 1, 2].map((i) => {
    const x = lerp(f, 59 + i * 1.2, 64.5 + i * 0.6, 1100, 0, easeIn);
    return <div key={i} style={{position: 'absolute', left: x, top: i * 640, width: 1080, height: 641, background: C.paper}} />;
  });

  return (
    <AbsoluteFill style={{background: cobaltBg, overflow: 'hidden'}}>
      {/* "i'm" */}
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 210,
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 170,
          lineHeight: 1,
          color: C.paper,
          clipPath: `inset(0 ${(1 - lerp(f, 35, 40, 0, 1, easeOut)) * 100}% 0 0)`,
          transform: `translateX(${lerp(f, 35, 41, -40, 0, easeOut)}px)`,
        }}
      >
        i’m
      </div>

      {row(392, -1.1, true, 0, 236)}
      {row(640, 3.0, false, 2, 300)}
      {row(900, -3.6, false, 4, 300)}

      {portraitOn ? (
        <>
          {portraitImg('brightness(0)', -42 * echo, -26 * echo, echo)}
          {portraitImg('brightness(0) invert(1)', 46 * echo, 30 * echo, echo)}
          {portraitImg(undefined, 0, 0)}
        </>
      ) : null}

      {bands}
    </AbsoluteFill>
  );
};
