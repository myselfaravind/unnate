import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {rnd} from '../lib/anim';

/**
 * Film grain: 8 pre-generated noise tiles, cycled every frame with seeded offsets
 * (deterministic — the same frame always renders the same grain).
 */
export const Grain: React.FC<{opacity: number}> = ({opacity}) => {
  const frame = useCurrentFrame();
  const tile = frame % 8;
  const ox = Math.floor(rnd(`gx${frame}`, 0, 512));
  const oy = Math.floor(rnd(`gy${frame}`, 0, 512));
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`grain/grain-${tile}.png`)})`,
        backgroundSize: '512px 512px',
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};
