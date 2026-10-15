import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ClipShot} from './components/ClipShot';
import {Grain} from './components/Grain';
import {SHOTS} from './data/shots';
import {MUSIC_SRC, T, VO_OFFSET, VO_SRC} from './data/timeline';
import {easeIn, lerp} from './lib/anim';
import {loadFonts} from './fonts';
import {FOLDER_INTERIOR, FolderFront, Folders} from './scenes/intro/Folders';
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
  const k = lerp(f, T.reelStart, T.drop, 1, 0, easeIn);
  const firstClip = `inset(${FOLDER_INTERIOR.top * k}px ${FOLDER_INTERIOR.right * k}px ${FOLDER_INTERIOR.bottom * k}px ${FOLDER_INTERIOR.left * k}px round ${24 * k}px)`;

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
          <ClipShot shot={shot} clip={i === 0 ? firstClip : undefined} />
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

      {/* ---------- AUDIO: supplied VO untouched; music ducked under it, full once the reel starts */}
      <Sequence from={VO_OFFSET}>
        <Audio src={staticFile(VO_SRC)} volume={1.12} />
      </Sequence>
      <Audio
        src={staticFile(MUSIC_SRC)}
        volume={(fr) =>
          interpolate(fr, [0, VO_OFFSET + 194, T.drop - 1, T.drop], [0.3, 0.3, 0.5, 0.78], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />
    </AbsoluteFill>
  );
};
