export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const C = {
  paper: '#F1F0EB',
  paperDeep: '#E6E4DC',
  ink: '#0C0C0E',
  grey: '#CBC8BF',
  cobalt: '#2340E8',
  cobaltDeep: '#0F1E8C',
  cobaltLight: '#5C7BFF',
  select: '#B9CBFF',
  selectHandle: '#2340E8',
};

// Two typefaces only: a tight grotesk for kinetic display type and an editorial italic serif.
export const SANS = '"Inter Tight", "Helvetica Neue", Arial, sans-serif';
export const SERIF = '"Instrument Serif", Georgia, serif';

export const paperBg = `radial-gradient(120% 80% at 50% 42%, #F7F6F2 0%, ${C.paper} 55%, ${C.paperDeep} 100%)`;
export const cobaltBg = `radial-gradient(110% 70% at 50% 38%, #4A66FF 0%, ${C.cobalt} 42%, ${C.cobaltDeep} 100%)`;
