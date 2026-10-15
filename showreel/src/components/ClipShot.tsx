import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame} from 'remotion';
import type {Shot} from '../data/shots';
import {easeInOut, lerp} from '../lib/anim';
import {FPS, H, W} from '../theme';

/**
 * One portfolio excerpt. Must be rendered inside a <Sequence from={shot.from} durationInFrames={shot.dur}>.
 * Trims the source with trimBefore (frames at composition fps), plays at shot.rate, always muted
 * (the soundtrack is music + VO only), and applies per-shot framing and an optional restrained grade.
 */
export const ClipShot: React.FC<{shot: Shot; clip?: string}> = ({shot, clip}) => {
  const f = useCurrentFrame();
  const t = shot.dur > 1 ? f / (shot.dur - 1) : 0;
  const video = (style: React.CSSProperties) => (
    <OffthreadVideo
      src={staticFile(shot.src)}
      trimBefore={Math.round(shot.srcIn * FPS)}
      playbackRate={shot.rate}
      muted
      style={{position: 'absolute', ...style}}
    />
  );

  let inner: React.ReactNode;
  const fr = shot.framing;
  if (fr.kind === 'fill') {
    // 9:16 source -> scale to canvas exactly (720x1280 -> 1080x1920); optional slow push
    const s = lerp(t, 0, 1, fr.scaleFrom ?? 1, fr.scaleTo ?? 1, easeInOut);
    inner = video({
      left: 0,
      top: 0,
      width: W,
      height: H,
      objectFit: 'cover',
      transform: `scale(${s})`,
      transformOrigin: `${(fr.originX ?? 0.5) * 100}% ${(fr.originY ?? 0.5) * 100}%`,
    });
  } else {
    // 16:9 source: render at full canvas height and slide a 9:16 window to the chosen subject x
    const zoom = lerp(t, 0, 1, fr.zoomFrom ?? 1, fr.zoomTo ?? 1, easeInOut);
    const k = (H / fr.srcH) * zoom;
    const cx = lerp(t, 0, 1, fr.centerFrom, fr.centerTo, easeInOut);
    const vw = fr.srcW * k;
    const vh = fr.srcH * k;
    const cy = (fr.centerY ?? 0.5) * vh;
    const left = Math.min(0, Math.max(W - vw, W / 2 - cx * k));
    const top = Math.min(0, Math.max(H - vh, H / 2 - cy));
    inner = video({left, top, width: vw, height: vh});
  }

  return <AbsoluteFill style={{overflow: 'hidden', filter: shot.grade, clipPath: clip, backgroundColor: '#000'}}>{inner}</AbsoluteFill>;
};
