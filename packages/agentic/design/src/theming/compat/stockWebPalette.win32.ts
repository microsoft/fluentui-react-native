import {
  colorBlack,
  colorBrandPrimary,
  colorBrandShade10,
  colorBrandShade20,
  colorBrandShade30,
  colorBrandShade40,
  colorBrandShade50,
  colorBrandShade60,
  colorBrandTint10,
  colorBrandTint20,
  colorBrandTint30,
  colorBrandTint40,
  colorBrandTint50,
  colorBrandTint60,
  colorBurgundyPrimary,
  colorRedPrimary,
  colorWhite,
} from '../../tokens/global.generated';
import type { ThemeColorDefinition } from '../types/Color.types';

import { createLegacyColorAliasTokens } from './createLegacyAliasTokens';
import { paletteFromFabricColors } from './defaultLegacyColors';

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
      red: colorRedPrimary,
      redDark: colorBurgundyPrimary,
      themeDarker: colorBrandShade40,
      themeDark: colorBrandShade20,
      themeDarkAlt: colorBrandShade10,
      themePrimary: colorBrandPrimary,
      themeSecondary: '#2b88d8',
      themeTertiary: '#71afe5',
      themeLight: colorBrandTint40,
      themeLighter: colorBrandTint50,
      themeLighterAlt: colorBrandTint60,
      accent: colorBrandPrimary,
      blackTranslucent40: 'rgba(0,0,0,.4)',
    }),
    ...createLegacyColorAliasTokens('light'),
  };
}

export function getStockWebDarkPalette(appearance: 'dark' | 'darkElevated' = 'dark'): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors(
      {
        themeDarker: '#82c7ff',
        themeDark: colorBrandTint30,
        themeDarkAlt: colorBrandTint20,
        themePrimary: colorBrandTint10,
        themeSecondary: colorBrandPrimary,
        themeTertiary: '#235a85',
        themeLight: colorBrandShade30,
        themeLighter: colorBrandShade50,
        themeLighterAlt: colorBrandShade60,
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
        accent: colorBrandPrimary,
        redDark: '#f1707b',
        blackTranslucent40: 'rgba(0,0,0,.4)',
      },
      true,
    ),
    ...createLegacyColorAliasTokens(appearance),
  };
}
