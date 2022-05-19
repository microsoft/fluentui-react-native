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
  shadow2: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000001f' },
    key: { x: 0, y: 1, blur: 2, color: '#00000024' },
  },
  shadow4: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000001f' },
    key: { x: 0, y: 2, blur: 4, color: '#00000024' },
  },
  shadow8: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000001f' },
    key: { x: 0, y: 4, blur: 8, color: '#00000024' },
  },
  shadow16: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000001f' },
    key: { x: 0, y: 8, blur: 16, color: '#00000024' },
  },
  shadow28: {
    ambient: { x: 0, y: 0, blur: 8, color: '#00000033' },
    key: { x: 0, y: 14, blur: 28, color: '#0000003d' },
  },
  shadow64: {
    ambient: { x: 0, y: 0, blur: 8, color: '#00000033' },
    key: { x: 0, y: 32, blur: 64, color: '#0000003d' },
  },
  shadow2brand: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000004d' },
    key: { x: 0, y: 1, blur: 2, color: '#00000040' },
  },
  shadow4brand: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000004d' },
    key: { x: 0, y: 2, blur: 4, color: '#00000040' },
  },
  shadow8brand: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000004d' },
    key: { x: 0, y: 4, blur: 8, color: '#00000040' },
  },
  shadow16brand: {
    ambient: { x: 0, y: 0, blur: 2, color: '#0000004d' },
    key: { x: 0, y: 8, blur: 16, color: '#00000040' },
  },
  shadow28brand: {
    ambient: { x: 0, y: 0, blur: 8, color: '#0000004d' },
    key: { x: 0, y: 14, blur: 28, color: '#00000040' },
  },
  shadow64brand: {
    ambient: { x: 0, y: 0, blur: 8, color: '#0000004d' },
    key: { x: 0, y: 32, blur: 64, color: '#00000040' },
  },
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
