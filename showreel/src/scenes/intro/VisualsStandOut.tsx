import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {Caret} from '../../components/Graphics';
import {easeIn, easeOut, lerp, pop} from '../../lib/anim';
import {C, FPS, SANS, SERIF, paperBg} from '../../theme';

/**
 * "visuals"  (global f114 – f133)
 * The word is a window: giant stacked letters are cut out of the paper and the real portfolio
 * footage plays through them (screen + multiply blend, so the paper stays paper).
 * Footage inside switches on the beat: juice splash -> sauce drizzle -> batter ribbons.
 * Rendered inside <Sequence from={114}>, so frame 0 here = global f114.
 */
const TEASERS: Array<{src: string; at: number; srcIn: number; rate: number; dur: number}> = [
  {src: 'video/solara.mp4', at: 0, srcIn: 9.7, rate: 1.2, dur: 7},
  {src: 'video/crave-build.mp4', at: 7, srcIn: 13.0, rate: 1.3, dur: 6},
  {src: 'video/hero-gorilla.mp4', at: 13, srcIn: 10.85, rate: 1.3, dur: 7},
];

export const Visuals: React.FC = () => {
  const l = useCurrentFrame();
  const lines: Array<{text: string; from: number}> = [
    {text: 'VISU', from: -1}, // from left
    {text: 'ALS', from: 1}, // from right
  ];
  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden', isolation: 'isolate'}}>
      {TEASERS.map((t) => (
        <Sequence key={t.at} from={t.at} durationInFrames={t.dur} layout="none">
          <AbsoluteFill>
            <OffthreadVideo
              src={staticFile(t.src)}
              trimBefore={Math.round(t.srcIn * FPS)}
              playbackRate={t.rate}
              muted
              style={{width: 1080, height: 1920, objectFit: 'cover', transform: 'scale(1.15)'}}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
      {/* white plate with black type, screen-blended: black type reveals the footage */}
      <AbsoluteFill style={{background: '#FFFFFF', mixBlendMode: 'screen', justifyContent: 'center', alignItems: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'translateY(-10px)'}}>
          {lines.map((line, li) => (
            <div key={li} style={{display: 'flex', height: 600, alignItems: 'center'}}>
              {line.text.split('').map((ch, i) => {
                const idx = li * 4 + i;
                const p = pop(l, idx * 0.8, {damping: 16, stiffness: 320});
                const out = lerp(l, 15 + idx * 0.5, 19 + idx * 0.5, 0, 1, easeIn);
                return (
                  <div
                    key={i}
                    style={{
                      fontFamily: SANS,
                      fontWeight: 900,
                      fontSize: 520,
                      lineHeight: 1,
                      letterSpacing: '-0.06em',
                      color: '#000000',
                      transform: `translate(${line.from * 1300 * (1 - p)}px, ${-2300 * out}px) scaleY(1.38)`,
                    }}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: C.paper, mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};

/** "that"  (global f133 – f139): a single small word in an empty field. */
export const That: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: paperBg, justifyContent: 'center', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', transform: `translateY(${lerp(f, 133, 136, 24, 0, easeOut)}px)`}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 104, color: C.ink, lineHeight: 1}}>that</div>
        <Caret frame={f + 4} height={88} width={5} style={{marginLeft: 10}} />
      </div>
    </AbsoluteFill>
  );
};

/**
 * "stand out."  (global f139 – f163)
 * A crowd of grey STANDs slides in row by row; one turns black and lifts on "stand"; on "out" a
 * cobalt OUT bursts from the centre, shoving the crowd outward, and overruns the frame.
 */
const ROWS = 11;
const COLS = 4;
const ROW_H = 176;
const COL_W = 480;

export const StandOut: React.FC = () => {
  const f = useCurrentFrame();
  const push = lerp(f, 153, 160, 0, 1, easeOut);
  const outP = pop(f, 153, {damping: 11, stiffness: 260});
  const outGrow = lerp(f, 158, 163, 1, 1.9, easeIn);
  const hero = {row: 5, col: 1};

  const words: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) {
    const dir = r % 2 === 0 ? 1 : -1;
    const p = pop(f, 139 + r * 0.6, {damping: 18, stiffness: 300});
    for (let c = 0; c < COLS; c++) {
      const x = c * COL_W - (r % 2 ? 260 : 40);
      const y = r * ROW_H - 10;
      const cx = x + 200 - 540;
      const cy = y + 70 - 960;
      const d = Math.max(120, Math.hypot(cx, cy));
      const isHero = r === hero.row && c === hero.col;
      const lift = isHero ? pop(f, 141, {damping: 10, stiffness: 260}) : 0;
      const shove = (push * 520 * 600) / (d + 300);
      words.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            fontFamily: SANS,
            fontWeight: 900,
            fontSize: 132,
            lineHeight: 1,
            letterSpacing: '-0.035em',
            color: isHero && f >= 141 ? C.ink : C.grey,
            transform: `translate(${dir * 1400 * (1 - p) + (cx / d) * shove}px, ${(cy / d) * shove - lift * 34}px) rotate(${-lift * 4}deg) scale(${1 + lift * 0.16})`,
            zIndex: isHero ? 2 : 1,
            opacity: isHero ? 1 : 1 - push * 0.45,
          }}
        >
          STAND
        </div>,
      );
    }
  }

  return (
    <AbsoluteFill style={{background: paperBg, overflow: 'hidden'}}>
      {words}
      {f >= 153 ? (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', zIndex: 3}}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 900,
              fontStyle: 'italic',
              fontSize: 600,
              lineHeight: 1,
              letterSpacing: '-0.06em',
              color: C.cobalt,
              transform: `scale(${(0.15 + 0.85 * outP) * outGrow}) rotate(${-7 + outP * 3}deg)`,
              textShadow: `0 24px 60px rgba(15,30,140,0.25)`,
            }}
          >
            OUT
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Pause in the VO (f163 – f172): almost nothing on screen — negative space before the reveal. */
export const Silence: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: paperBg, justifyContent: 'center', alignItems: 'center'}}>
      <Caret frame={f - 163} height={96} width={7} />
    </AbsoluteFill>
  );
};
