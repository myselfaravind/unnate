import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are bundled locally (from @fontsource, SIL OFL) so renders never depend on the network.
const faces: Array<[string, string, string, string]> = [
  ['Inter Tight', 'fonts/inter-tight-latin-600-normal.woff2', '600', 'normal'],
  ['Inter Tight', 'fonts/inter-tight-latin-800-normal.woff2', '800', 'normal'],
  ['Inter Tight', 'fonts/inter-tight-latin-900-normal.woff2', '900', 'normal'],
  ['Inter Tight', 'fonts/inter-tight-latin-900-italic.woff2', '900', 'italic'],
  ['Instrument Serif', 'fonts/instrument-serif-latin-400-normal.woff2', '400', 'normal'],
  ['Instrument Serif', 'fonts/instrument-serif-latin-400-italic.woff2', '400', 'italic'],
];

let started = false;

export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('Loading fonts');
  Promise.all(
    faces.map(([family, file, weight, style]) => {
      const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {weight, style});
      return face.load().then((f) => (document.fonts as unknown as {add: (f: FontFace) => void}).add(f));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
