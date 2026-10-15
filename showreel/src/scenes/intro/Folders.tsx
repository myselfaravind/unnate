import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Folder, Pointer} from '../../components/Graphics';
import {easeIn, easeInOut, easeOut, lerp, pop, rnd} from '../../lib/anim';
import {paperBg} from '../../theme';

/**
 * "Here's what I do."  (global f172 – f200)
 * Folders fly in from beyond the frame and settle around one large folder; a cursor double-clicks
 * it, it opens, the satellites blow out past the edges and the first portfolio shot expands out of
 * the folder (see FOLDER_INTERIOR + Showreel) to full frame on the downbeat at f200.
 */
export const FOLDER = {w: 640, left: 220, top: 700};
const FH = FOLDER.w * 0.78;
/** clip-path inset of the folder's paper area — where the first shot is born. */
export const FOLDER_INTERIOR = {
  top: FOLDER.top + FH * 0.2,
  right: 1080 - (FOLDER.left + FOLDER.w * 0.93),
  bottom: 1920 - (FOLDER.top + FH * 0.8),
  left: FOLDER.left + FOLDER.w * 0.07,
};

const SATS = Array.from({length: 10}).map((_, i) => {
  const ang = (i / 10) * Math.PI * 2 + rnd(`fa${i}`, -0.25, 0.25);
  const rad = rnd(`fr${i}`, 520, 760);
  return {
    x: 540 + Math.cos(ang) * rad * 0.72,
    y: 960 + Math.sin(ang) * rad,
    w: rnd(`fw${i}`, 120, 250),
    rot: rnd(`fo${i}`, -16, 16),
    ang,
    delay: rnd(`fd${i}`, 0, 5),
  };
});

export const Folders: React.FC = () => {
  const f = useCurrentFrame();
  const blow = lerp(f, 188, 199, 0, 1, easeIn);
  const mainP = pop(f, 173, {damping: 11, stiffness: 230});
  const open = lerp(f, 189, 194, 0, 1, easeOut);
  const press = (f >= 185 && f < 187) || (f >= 188 && f < 190) ? 1 : 0;
  const cx = lerp(f, 176, 185, 1180, 600, easeInOut);
  const cy = lerp(f, 176, 185, 1760, 1010, easeInOut);
  const cursorOut = lerp(f, 191, 197, 0, 1, easeIn);

  return (
    <AbsoluteFill style={{background: paperBg, overflow: 'hidden'}}>
      {SATS.map((s, i) => {
        const p = pop(f, 172 + s.delay, {damping: 15, stiffness: 200});
        const fromX = 540 + Math.cos(s.ang) * 1500;
        const fromY = 960 + Math.sin(s.ang) * 1700;
        const x = fromX + (s.x - fromX) * p + Math.cos(s.ang) * 1300 * blow;
        const y = fromY + (s.y - fromY) * p + Math.sin(s.ang) * 1500 * blow + Math.sin((f + i * 7) / 6) * 6;
        return (
          <div key={i} style={{position: 'absolute', left: x - s.w / 2, top: y - s.w * 0.39, transform: `rotate(${s.rot + (1 - p) * 90}deg)`}}>
            <Folder width={s.w} tint={i % 3 === 0 ? 'cobalt' : 'light'} showPaper={i % 2 === 0} />
          </div>
        );
      })}

      <div
        style={{
          position: 'absolute',
          left: FOLDER.left,
          top: FOLDER.top,
          transform: `scale(${mainP})`,
          transformOrigin: '50% 60%',
          // from f194 the front panel is drawn by <FolderFront/> above the expanding footage
          opacity: f >= 194 ? 0 : 1,
        }}
      >
        <Folder width={FOLDER.w} open={open} />
      </div>

      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy + cursorOut * 900,
          opacity: f >= 176 ? 1 - cursorOut : 0,
        }}
      >
        <Pointer size={90} press={press} />
      </div>
    </AbsoluteFill>
  );
};

/** The folder's front panel, drawn above the first shot while it bursts out (f194 – f200). */
export const FolderFront: React.FC = () => {
  const f = useCurrentFrame(); // global frame (rendered without a Sequence offset)
  const fall = lerp(f, 194, 200, 0, 1, easeIn);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: FOLDER.left,
          top: FOLDER.top + fall * 900,
          transform: `rotate(${fall * 14}deg)`,
          opacity: 1 - fall,
        }}
      >
        <Folder width={FOLDER.w} open={1} frontOnly />
      </div>
    </AbsoluteFill>
  );
};
