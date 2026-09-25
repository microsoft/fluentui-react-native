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

const rgb0000001f = '#0000001f';
const rgb00000024 = '#00000024';
const rgb0000004d = '#0000004d';
const rgb00000040 = '#00000040';
const rgb00000033 = '#00000033';
const rgb0000003d = '#0000003d';
const rgb00000047 = '#00000047';
const rgb00000066 = '#00000066';
const rgb0000007a = '#0000007a';

const dims0 = { x: 0, y: 0, blur: 2 };
const dims1 = { x: 0, y: 1, blur: 2 };
const dims2 = { x: 0, y: 2, blur: 4 };
const dims3 = { x: 0, y: 4, blur: 8 };
const dims4 = { x: 0, y: 8, blur: 16 };
const dims5 = { x: 0, y: 0, blur: 8 };
const dims6 = { x: 0, y: 14, blur: 28 };
const dims7 = { x: 0, y: 32, blur: 64 };

const shadow0 = makeShadow(rgb0000001f, dims0, rgb00000024, dims1);
const shadow1 = makeShadow(rgb0000004d, dims0, rgb00000040, dims1);
const shadow2 = makeShadow(rgb0000001f, dims0, rgb00000024, dims2);
const shadow3 = makeShadow(rgb0000004d, dims0, rgb00000040, dims2);
const shadow4 = makeShadow(rgb0000001f, dims0, rgb00000024, dims3);
const shadow5 = makeShadow(rgb0000004d, dims0, rgb00000040, dims3);
const shadow6 = makeShadow(rgb0000001f, dims0, rgb00000024, dims4);
const shadow7 = makeShadow(rgb0000004d, dims0, rgb00000040, dims4);
const shadow8 = makeShadow(rgb00000033, dims5, rgb0000003d, dims6);
const shadow9 = makeShadow(rgb0000004d, dims5, rgb00000040, dims6);
const shadow10 = makeShadow(rgb00000033, dims5, rgb0000003d, dims7);
const shadow11 = makeShadow(rgb0000004d, dims5, rgb00000040, dims7);
const shadow12 = makeShadow(rgb0000003d, dims0, rgb00000047, dims1);
const shadow13 = makeShadow(rgb0000003d, dims0, rgb00000047, dims2);
const shadow14 = makeShadow(rgb0000003d, dims0, rgb00000047, dims3);
const shadow15 = makeShadow(rgb0000003d, dims0, rgb00000047, dims4);
const shadow16 = makeShadow(rgb00000066, dims5, rgb0000007a, dims6);
const shadow17 = makeShadow(rgb00000066, dims5, rgb0000007a, dims7);

const shadowsCommon = {
  shadow2brand: shadow1,
  shadow4brand: shadow3,
  shadow8brand: shadow5,
  shadow16brand: shadow7,
  shadow28brand: shadow9,
  shadow64brand: shadow11,
};
const shadowsDarkHclightHcdark = {
  shadow2: shadow12,
  shadow4: shadow13,
  shadow8: shadow14,
  shadow16: shadow15,
  shadow28: shadow16,
  shadow64: shadow17,
};

export const lightShadows = {
  ...shadowsCommon,
  shadow2: shadow0,
  shadow4: shadow2,
  shadow8: shadow4,
  shadow16: shadow6,
  shadow28: shadow8,
  shadow64: shadow10,
};
export const darkShadows = { ...shadowsDarkHclightHcdark, ...shadowsCommon };
export const hclightShadows = { ...shadowsDarkHclightHcdark, ...shadowsCommon };
export const hcdarkShadows = { ...shadowsDarkHclightHcdark, ...shadowsCommon };

