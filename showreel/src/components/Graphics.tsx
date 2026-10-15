import React from 'react';
import {C} from '../theme';

/** Glossy cobalt sphere — the recurring "object" that replaces letters and carries transitions. */
export const Sphere: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle at 34% 30%, #FFFFFF 0%, #A9B8FF 9%, ${C.cobaltLight} 24%, ${C.cobalt} 52%, ${C.cobaltDeep} 86%, #070E4A 100%)`,
      boxShadow: `0 ${size * 0.08}px ${size * 0.16}px rgba(15,30,140,0.28)`,
      flexShrink: 0,
      ...style,
    }}
  />
);

/** Text caret (blinks on an 8-frame cycle). */
export const Caret: React.FC<{frame: number; height: number; color?: string; width?: number; style?: React.CSSProperties}> = ({
  frame,
  height,
  color = C.cobalt,
  width = 6,
  style,
}) => <div style={{width, height, background: color, opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0, ...style}} />;

/** OS-style selection highlight with drag handles (from the reference's "focus" selection motif). */
export const Selection: React.FC<{progress: number; width: number; height: number; children: React.ReactNode}> = ({
  progress,
  width,
  height,
  children,
}) => {
  const w = width * progress;
  return (
    <div style={{position: 'relative', width, height}}>
      <div style={{position: 'absolute', left: 0, top: 0, height, width: w, background: C.select}} />
      {[0, w].map((x, i) => (
        <div key={i} style={{position: 'absolute', left: x - 2, top: i === 0 ? -14 : 0, width: 4, height: height + 14, background: C.selectHandle}}>
          <div
            style={{
              position: 'absolute',
              left: -7,
              top: i === 0 ? -6 : height + 8,
              width: 18,
              height: 18,
              borderRadius: 9,
              background: C.selectHandle,
            }}
          />
        </div>
      ))}
      <div style={{position: 'relative'}}>{children}</div>
    </div>
  );
};

/** Flat folder icon, drawn as layered parts so the front can open. */
export const Folder: React.FC<{
  width: number;
  open?: number; // 0..1 front-panel rotation
  tint?: 'cobalt' | 'light';
  showPaper?: boolean;
  frontOnly?: boolean;
  style?: React.CSSProperties;
}> = ({width, open = 0, tint = 'cobalt', showPaper = true, frontOnly = false, style}) => {
  const h = width * 0.78;
  const back = tint === 'cobalt' ? C.cobaltDeep : '#7C93F5';
  const front =
    tint === 'cobalt'
      ? `linear-gradient(180deg, ${C.cobaltLight} 0%, ${C.cobalt} 60%, #1B33C8 100%)`
      : 'linear-gradient(180deg, #C9D4FF 0%, #9DB0FF 100%)';
  return (
    <div style={{position: 'relative', width, height: h, perspective: width * 3, ...style}}>
      {/* tab + back */}
      {frontOnly ? null : (
        <>
      <div style={{position: 'absolute', left: 0, top: 0, width: width * 0.42, height: h * 0.2, background: back, borderRadius: `${width * 0.03}px ${width * 0.03}px 0 0`}} />
      <div style={{position: 'absolute', left: 0, top: h * 0.12, width, height: h * 0.88, background: back, borderRadius: width * 0.035}} />
        </>
      )}
      {showPaper && !frontOnly ? (
        <div style={{position: 'absolute', left: width * 0.07, top: h * 0.2 - open * h * 0.06, width: width * 0.86, height: h * 0.6, background: '#FBFBF8', borderRadius: width * 0.015}} />
      ) : null}
      {/* front panel */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: h * 0.27,
          width,
          height: h * 0.73,
          background: front,
          borderRadius: width * 0.035,
          transformOrigin: '50% 100%',
          transform: `rotateX(${open * 62}deg)`,
          boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.35)',
        }}
      />
    </div>
  );
};

/** Pointer cursor. */
export const Pointer: React.FC<{size: number; press?: number; style?: React.CSSProperties}> = ({size, press = 0, style}) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 20 28" style={{transform: `scale(${1 - press * 0.15})`, transformOrigin: '10% 10%', ...style}}>
    <path d="M1 1 L1 22 L6.5 17 L10.5 26 L14 24.5 L10 15.8 L17.5 15.8 Z" fill={C.ink} stroke="#FFFFFF" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);
