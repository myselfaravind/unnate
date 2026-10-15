import React from 'react';
import {Composition} from 'remotion';
import {Showreel} from './Showreel';
import {TOTAL_FRAMES} from './data/timeline';
import {FPS, H, W} from './theme';

export const RemotionRoot: React.FC = () => (
  <Composition id="Showreel" component={Showreel} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
);
