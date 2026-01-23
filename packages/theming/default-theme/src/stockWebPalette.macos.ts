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

      themeDarker: globalTokens.color.brand.shade40,
      themeDark: globalTokens.color.brand.shade20,
      themeDarkAlt: globalTokens.color.brand.shade10,
      themePrimary: globalTokens.color.brand.primary,
      themeSecondary: '#2b88d8',
      themeTertiary: '#71afe5',
      themeLight: globalTokens.color.brand.tint40,
      themeLighter: globalTokens.color.brand.tint50,
      themeLighterAlt: globalTokens.color.brand.tint60,
      accent: globalTokens.color.brand.primary,
      blackTranslucent40: 'rgba(0,0,0,.4)',
    }),
    ...createColorAliasTokens('light'),
  };
}

export function getStockWebDarkPalette(): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors(
      {
        // colors taken from fluentui DarkCustomizations.ts
        themeDarker: '#82c7ff',
        themeDark: globalTokens.color.brand.tint30,
        themeDarkAlt: globalTokens.color.brand.tint20,
        themePrimary: globalTokens.color.brand.tint10,
        themeSecondary: globalTokens.color.brand.primary,
        themeTertiary: '#235a85',
        themeLight: globalTokens.color.brand.shade30,
        themeLighter: globalTokens.color.brand.shade50,
        themeLighterAlt: globalTokens.color.brand.shade60,
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
        accent: globalTokens.color.brand.primary,
        redDark: '#f1707b',
        blackTranslucent40: 'rgba(0,0,0,.4)',
      },
      true,
    ),
    ...createColorAliasTokens('dark'),
  };
}
