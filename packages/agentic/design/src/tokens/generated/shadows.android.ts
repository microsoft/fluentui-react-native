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
const shadow8 = makeShadow(rgb0000001f, dims5, rgb00000024, dims6);
const shadow9 = makeShadow(rgb0000004d, dims5, rgb00000040, dims6);
const shadow10 = makeShadow(rgb0000001f, dims5, rgb00000024, dims7);
const shadow11 = makeShadow(rgb0000004d, dims5, rgb00000040, dims7);

const shadowsCommon = {
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

export const lightShadows = shadowsCommon;
export const darkShadows = shadowsCommon;

