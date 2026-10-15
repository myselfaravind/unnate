import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ClipShot} from './components/ClipShot';
import {Grain} from './components/Grain';
import {SHOTS} from './data/shots';
import {MUSIC_SRC, T, VO_OFFSET, VO_SRC} from './data/timeline';
import {easeIn, lerp} from './lib/anim';
import {loadFonts} from './fonts';
import {FolderFront, Folders, diveClip} from './scenes/intro/Folders';
import {Hello} from './scenes/intro/Hello';
import {Ideas} from './scenes/intro/Ideas';
import {Name} from './scenes/intro/Name';
import {Creative, Turn} from './scenes/intro/TurnCreative';
import {Silence, StandOut, That, Visuals} from './scenes/intro/VisualsStandOut';
import {Outro} from './scenes/Outro';

loadFonts();

/** Intro scenes keyed to the VO (see data/timeline.ts). Scenes read the global frame, except Visuals. */
const INTRO: Array<{from: number; to: number; el: React.ReactNode; local?: boolean}> = [
  {from: T.hello, to: T.name + 2, el: <Hello />},
  {from: T.name, to: T.turn + 2, el: <Name />},
  {from: T.turn, to: T.creative, el: <Turn />},
  {from: T.creative, to: T.ideas, el: <Creative />},
  {from: T.ideas, to: T.visuals, el: <Ideas />},
  {from: T.visuals, to: T.that, el: <Visuals />, local: true},
  {from: T.that, to: T.standOut, el: <That />},
  {from: T.standOut, to: T.silence, el: <StandOut />},
  {from: T.silence, to: T.folders, el: <Silence />},
  {from: T.folders, to: T.drop, el: <Folders />},
];

/** Global-frame passthrough: renders children only inside [from, to) without shifting time. */
const Window: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <>{children}</> : null;
};

export const Showreel: React.FC = () => {
  const f = useCurrentFrame();

  // first shot is born inside the folder (f194) and reaches full frame on the downbeat (f200)
  const firstClip = f < T.drop ? diveClip(f) : undefined;
  const firstBlur = lerp(f, T.reelStart, T.drop, 9, 0, easeIn);

  const grain = f < T.drop ? 0.13 : f < T.outro ? 0.05 : 0.13;

  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      {/* ---------- INTRO (motion design, VO-driven) */}
      {INTRO.map((s) =>
        s.local ? (
          <Sequence key={s.from} from={s.from} durationInFrames={s.to - s.from}>
            {s.el}
          </Sequence>
        ) : (
          <Window key={s.from} from={s.from} to={s.to}>
            {s.el}
          </Window>
        ),
      )}

      {/* ---------- PORTFOLIO (real footage, excerpts only) */}
      {SHOTS.map((shot, i) => (
        <Sequence key={shot.id} from={shot.from} durationInFrames={shot.dur} name={shot.id}>
          {i === 0 ? (
            <AbsoluteFill style={{filter: firstBlur > 0.05 ? `blur(${firstBlur}px)` : undefined}}>
              <ClipShot shot={shot} clip={firstClip} />
            </AbsoluteFill>
          ) : (
            <ClipShot shot={shot} />
          )}
        </Sequence>
      ))}
      <Window from={T.reelStart} to={T.drop}>
        <FolderFront />
      </Window>

      {/* ---------- SIGN-OFF */}
      <Window from={T.outro} to={T.end}>
        <Outro />
      </Window>

      <Grain opacity={grain} />

      {/* ---------- AUDIO: supplied VO untouched; music sits under it, the build rises from f160, the drop lands at f200 */}
      <Sequence from={VO_OFFSET}>
        <Audio src={staticFile(VO_SRC)} volume={1.12} />
      </Sequence>
      <Audio
        src={staticFile(MUSIC_SRC)}
        volume={(fr) =>
          interpolate(fr, [0, 160, 196, T.drop - 1, T.drop], [0.19, 0.19, 0.3, 0.3, 0.56], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
    </AbsoluteFill>
  );
};
