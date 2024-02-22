/* eslint-disable @typescript-eslint/ban-ts-comment */
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { ThemeColorDefinition } from '@fluentui-react-native/theme-types';

import { createColorAliasTokens } from './createAliasTokens';
import { paletteFromFabricColors } from './defaultColors';

export function getStockWebPalette(): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors({
      black: globalTokens.color.black,
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
      white: globalTokens.color.white,
      // Shared Colors
      red: globalTokens.color.red.primary,
      redDark: globalTokens.color.burgundy.primary,

      // @ts-ignore
      accent: globalTokens.color.brand80,
      blackTranslucent40: 'rgba(0,0,0,.4)',

      // Colors to be deprecated
      // @ts-ignore
      themeDarker: globalTokens.color.brand40,
      // @ts-ignore
      themeDark: globalTokens.color.brand60,
      // @ts-ignore
      themeDarkAlt: globalTokens.color.brand70,
      // @ts-ignore
      themePrimary: globalTokens.color.brand80,
      // @ts-ignore
      themeSecondary: globalTokens.color.brand90,
      // @ts-ignore
      themeTertiary: globalTokens.color.brand120,
      // @ts-ignore
      themeLight: globalTokens.color.brand140,
      // @ts-ignore
      themeLighter: globalTokens.color.brand150,
      // @ts-ignore
      themeLighterAlt: globalTokens.color.brand160,
    }),
    ...createColorAliasTokens('light'),
  };
}

export function getStockWebDarkPalette(): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors(
      {
        // colors taken from fluentui DarkCustomizations.ts
        black: globalTokens.color.white,
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
        red: globalTokens.color.red.primary,
        // @ts-ignore
        accent: globalTokens.color.brand40,
        redDark: '#f1707b',
        blackTranslucent40: 'rgba(0,0,0,.4)',

        // Colors to be deprecated
        // @ts-ignore
        themeDarker: globalTokens.color.brand110,
        // @ts-ignore
        themeDark: globalTokens.color.brand100,
        // @ts-ignore
        themeDarkAlt: globalTokens.color.brand100,
        // @ts-ignore
        themePrimary: globalTokens.color.brand90,
        // @ts-ignore
        themeSecondary: globalTokens.color.brand90,
        // @ts-ignore
        themeTertiary: globalTokens.color.brand60,
        // @ts-ignore
        themeLight: globalTokens.color.brand50,
        // @ts-ignore
        themeLighter: globalTokens.color.brand40,
        // @ts-ignore
        themeLighterAlt: globalTokens.color.brand30,
      },
      true,
    ),
    ...createColorAliasTokens('dark'),
  };
}
