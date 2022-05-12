import { Spacing, Theme } from '@fluentui-react-native/theme-types';
import { getFluentUIAndroidPalette } from './colorsSemantic';
import { paletteFromAndroidColors } from './colorsTokens';
import { androidTypography } from './androidTypography';
import { getAndroidPalette } from './colorsBase';

export function androidSpacing(): Spacing {
  return {
    s2: '8px',
    s1: '12px',
    m: '16px',
    l1: '20px',
    l2: '24px',
  };
}

export const androidComponents = {
  Checkbox: {
    checkbox: {
      style: {
        borderWidth: 2,
        minHeight: 18,
        minWidth: 18,
      },
    },
    checkmarkIcon: {
      width: 14,
      height: 10,
      style: {
        marginVertical: 4,
        marginHorizontal: 2,
      },
    },
  },
};

// mocked out
const androidShadows = {
  shadow2: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow4: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow8: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow16: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow28: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow64: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow2brand: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow4brand: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow8brand: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow16brand: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow28brand: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
  shadow64brand: { ambient: { x: 0, y: 0, blur: 0, color: 'transparent' }, key: { x: 0, y: 0, blur: 0, color: 'transparent' } },
};

export function getAndroidTheme(appearance: 'light' | 'dark'): Theme {
  return {
    colors: paletteFromAndroidColors(getFluentUIAndroidPalette(getAndroidPalette(appearance))),
    typography: androidTypography(),
    shadows: androidShadows,
    spacing: androidSpacing(),
    components: androidComponents,
    host: { appearance },
  };
}
