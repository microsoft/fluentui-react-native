/** Generated file. Do not edit. */

type ShadowRect = {
  x: number;
  y: number;
  blur: number;
};

function makeShadow(color1: string, rc1: ShadowRect, color2: string, rc2: ShadowRect) {
  return {
    ambient: { color: color1, ...rc1 },
    key: { color: color2, ...rc2 }
  };
}

const color0 = '#0000001f';
const color1 = '#00000024';
const color2 = '#0000004d';
const color3 = '#00000040';
const color4 = '#00000033';
const color5 = '#0000003d';
const color6 = '#00000047';
const color7 = '#00000066';
const color8 = '#0000007a';

const dims0 = { x: 0, y: 0, blur: 2 };
const dims1 = { x: 0, y: 1, blur: 2 };
const dims2 = { x: 0, y: 2, blur: 4 };
const dims3 = { x: 0, y: 4, blur: 8 };
const dims4 = { x: 0, y: 8, blur: 16 };
const dims5 = { x: 0, y: 0, blur: 8 };
const dims6 = { x: 0, y: 14, blur: 28 };
const dims7 = { x: 0, y: 32, blur: 64 };

const shadow0 = makeShadow(color0, dims0, color1, dims1);
const shadow1 = makeShadow(color2, dims0, color3, dims1);
const shadow2 = makeShadow(color0, dims0, color1, dims2);
const shadow3 = makeShadow(color2, dims0, color3, dims2);
const shadow4 = makeShadow(color0, dims0, color1, dims3);
const shadow5 = makeShadow(color2, dims0, color3, dims3);
const shadow6 = makeShadow(color0, dims0, color1, dims4);
const shadow7 = makeShadow(color2, dims0, color3, dims4);
const shadow8 = makeShadow(color4, dims5, color5, dims6);
const shadow9 = makeShadow(color2, dims5, color3, dims6);
const shadow10 = makeShadow(color4, dims5, color5, dims7);
const shadow11 = makeShadow(color2, dims5, color3, dims7);
const shadow12 = makeShadow(color5, dims0, color6, dims1);
const shadow13 = makeShadow(color5, dims0, color6, dims2);
const shadow14 = makeShadow(color5, dims0, color6, dims3);
const shadow15 = makeShadow(color5, dims0, color6, dims4);
const shadow16 = makeShadow(color7, dims5, color8, dims6);
const shadow17 = makeShadow(color7, dims5, color8, dims7);

const themeShadows0 = {
  shadow2: shadow0,
  shadow2brand: shadow1,
  shadow4: shadow2,
  shadow4brand: shadow3,
  shadow8: shadow4,
  shadow8brand: shadow5,
  shadow16: shadow6,
  shadow16brand: shadow7,
  shadow28: shadow8,
  shadow28brand: shadow9,
  shadow64: shadow10,
  shadow64brand: shadow11,
};
const themeShadows1 = {
  shadow2: shadow12,
  shadow2brand: shadow1,
  shadow4: shadow13,
  shadow4brand: shadow3,
  shadow8: shadow14,
  shadow8brand: shadow5,
  shadow16: shadow15,
  shadow16brand: shadow7,
  shadow28: shadow16,
  shadow28brand: shadow9,
  shadow64: shadow17,
  shadow64brand: shadow11,
};

export const lightShadows = themeShadows0;
export const darkShadows = themeShadows1;
