/* eslint-disable @typescript-eslint/ban-ts-comment */
import { colorBlack, colorBurgundyPrimary, colorRedPrimary, colorWhite } from '../../tokens/global.generated';
import globalTokens from '../../tokens/legacy/tokens-global';
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
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      accent: globalTokens.color.brand80,
      blackTranslucent40: 'rgba(0,0,0,.4)',
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      themeDarker: globalTokens.color.brand40,
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      themeDark: globalTokens.color.brand60,
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      themeDarkAlt: globalTokens.color.brand70,
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      themePrimary: globalTokens.color.brand80,
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      themeSecondary: globalTokens.color.brand90,
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      themeTertiary: globalTokens.color.brand120,
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      themeLight: globalTokens.color.brand140,
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      themeLighter: globalTokens.color.brand150,
      // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
      themeLighterAlt: globalTokens.color.brand160,
    }),
    ...createLegacyColorAliasTokens('light'),
  };
}

export function getStockWebDarkPalette(appearance: 'dark' | 'darkElevated' = 'dark'): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors(
      {
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
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        accent: globalTokens.color.brand40,
        redDark: '#f1707b',
        blackTranslucent40: 'rgba(0,0,0,.4)',
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        themeDarker: globalTokens.color.brand110,
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        themeDark: globalTokens.color.brand100,
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        themeDarkAlt: globalTokens.color.brand100,
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        themePrimary: globalTokens.color.brand90,
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        themeSecondary: globalTokens.color.brand90,
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        themeTertiary: globalTokens.color.brand60,
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        themeLight: globalTokens.color.brand50,
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        themeLighter: globalTokens.color.brand40,
        // @ts-expect-error The mobile token payloads retain the legacy flat brand ramp.
        themeLighterAlt: globalTokens.color.brand30,
      },
      true,
    ),
    ...createLegacyColorAliasTokens(appearance),
  };
}
