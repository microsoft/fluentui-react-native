/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { ThemeColorDefinition } from '@fluentui-react-native/design/theming';
import {
  colorBlack,
  colorBrand30,
  colorBrand40,
  colorBrand50,
  colorBrand60,
  colorBrand70,
  colorBrand80,
  colorBrand90,
  colorBrand100,
  colorBrand110,
  colorBrand120,
  colorBrand140,
  colorBrand150,
  colorBrand160,
  colorBurgundyPrimary,
  colorRedPrimary,
  colorWhite,
} from '@fluentui-react-native/design/tokens/global';

import { createColorAliasTokens } from './createAliasTokens';
import { paletteFromFabricColors } from './defaultColors';

export function getStockWebPalette(): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors({
      black: colorBlack,
      neutralDark: '#201f1e',
      neutralPrimary: '#323130',
      neutralPrimaryAlt: '#3b3a39',
      neutralSecondary: '#605e5c',
      neutralSecondaryAlt: '#8a8886',
      neutralTertiary: '#a19f9d',
      neutralTertiaryAlt: '#c8c6c4',
      neutralQuaternary: '#d2d0ce',
      neutralQuaternaryAlt: '#e1dfdd',
      neutralLight: '#edebe9',
      neutralLighter: '#f3f2f1',
      neutralLighterAlt: '#faf9f8',
      white: colorWhite,
      // Shared Colors
      red: colorRedPrimary,
      redDark: colorBurgundyPrimary,

      accent: colorBrand80,
      blackTranslucent40: 'rgba(0,0,0,.4)',

      // Colors to be deprecated
      themeDarker: colorBrand40,
      themeDark: colorBrand60,
      themeDarkAlt: colorBrand70,
      themePrimary: colorBrand80,
      themeSecondary: colorBrand90,
      themeTertiary: colorBrand120,
      themeLight: colorBrand140,
      themeLighter: colorBrand150,
      themeLighterAlt: colorBrand160,
    }),
    ...createColorAliasTokens('light'),
  };
}

export function getStockWebDarkPalette(): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors(
      {
        // colors taken from fluentui DarkCustomizations.ts
        black: colorWhite,
        neutralDark: '#faf9f8',
        neutralPrimary: '#f3f2f1',
        neutralPrimaryAlt: '#c8c6c4',
        neutralSecondary: '#a19f9d',
        neutralSecondaryAlt: '#979693',
        neutralTertiary: '#797775',
        neutralTertiaryAlt: '#484644',
        neutralQuaternary: '#3b3a39',
        neutralQuaternaryAlt: '#323130',
        neutralLight: '#292827',
        neutralLighter: '#252423',
        neutralLighterAlt: '#201f1e',
        white: '#1b1a19',
        red: colorRedPrimary,
        accent: colorBrand40,
        redDark: '#f1707b',
        blackTranslucent40: 'rgba(0,0,0,.4)',

        // Colors to be deprecated
        themeDarker: colorBrand110,
        themeDark: colorBrand100,
        themeDarkAlt: colorBrand100,
        themePrimary: colorBrand90,
        themeSecondary: colorBrand90,
        themeTertiary: colorBrand60,
        themeLight: colorBrand50,
        themeLighter: colorBrand40,
        themeLighterAlt: colorBrand30,
      },
      true,
    ),
    ...createColorAliasTokens('dark'),
  };
}
