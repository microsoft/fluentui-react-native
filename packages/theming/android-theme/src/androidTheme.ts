import { memoize } from '@fluentui-react-native/framework-base/memo-cache';
import type { Spacing, Theme } from '@fluentui-react-native/theme-types';

import { androidShadows } from './androidShadows';
import { androidTypography } from './androidTypography';
import { getAndroidPalette } from './colorsBase';
import { getFluentUIAndroidPalette } from './colorsSemantic';
import { paletteFromAndroidColors } from './colorsTokens';

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

function getAndroidThemeWorker(appearance: 'light' | 'dark'): Theme {
  return {
    colors: paletteFromAndroidColors(getFluentUIAndroidPalette(getAndroidPalette(appearance))),
    typography: androidTypography(),
    shadows: androidShadows(),
    spacing: androidSpacing(),
    components: androidComponents,
    host: { appearance },
  };
}

export const getAndroidTheme = memoize(getAndroidThemeWorker);
