import { Platform } from 'react-native';

import { fontWeightRegular, fontWeightSemibold } from '../../tokens/global.generated';
import globalTokens from '../../tokens/legacy/tokens-global';
import { appearanceOptionFromResolved, themeAppearanceKey } from '../appearance';
import type { ResolvedThemeAppearance } from '../appearance.types';
import type { Theme, Spacing } from '../types/Theme.types';
import type { FontSize, FontSizes, FontWeightValue, Typography, Variants } from '../types/Typography.types';

import { createLegacyShadowAliasTokens } from './createLegacyAliasTokens';
import { getStockWebHighContrastPalette } from './defaultLegacyColors';
import { getStockWebDarkPalette, getStockWebPalette } from './stockWebPalette';

let defaultTypography: Typography | undefined;
let defaultSpacing: Spacing | undefined;
const defaultThemes = new Map<string, Theme>();

function getDefaultTypography(): Typography {
  if (defaultTypography) {
    return defaultTypography;
  }

  const typography = {
    sizes: {
      caption: globalTokens.font.size100 as FontSize,
      secondary: globalTokens.font.size200 as FontSize,
      body: globalTokens.font.size300 as FontSize,
      subheader: globalTokens.font.size400 as FontSize,
      header: globalTokens.font.size500 as FontSize,
      hero: globalTokens.font.size700 as FontSize,
      heroLarge: globalTokens.font.size900 as FontSize,
    } as FontSizes,
    weights: {
      regular: fontWeightRegular as FontWeightValue,
      semiBold: fontWeightSemibold as FontWeightValue,
    },
    families: {
      primary: 'Segoe UI',
      secondary: 'Segoe UI',
      cursive: 'System',
      monospace: 'System',
      numeric: 'System',
      sansSerif: 'System',
      serif: 'System',
    },
    variants: {
      captionStandard: { face: 'primary', size: 'caption', weight: 'regular' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: 'regular' },
      secondarySemibold: { face: 'primary', size: 'secondary', weight: 'semiBold' },
      bodyStandard: { face: 'primary', size: 'body', weight: 'regular' },
      bodySemibold: { face: 'primary', size: 'body', weight: 'semiBold' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: 'regular' },
      subheaderSemibold: { face: 'primary', size: 'subheader', weight: 'semiBold' },
      headerStandard: { face: 'primary', size: 'header', weight: 'regular' },
      headerSemibold: { face: 'primary', size: 'header', weight: 'semiBold' },
      heroStandard: { face: 'primary', size: 'hero', weight: 'regular' },
      heroSemibold: { face: 'primary', size: 'hero', weight: 'semiBold' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: 'regular' },
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: 'semiBold' },
      caption1: { face: 'primary', size: 'caption', weight: 'regular' },
      caption1Strong: { face: 'primary', size: 'caption', weight: 'semiBold' },
      body1: { face: 'primary', size: 'secondary', weight: 'regular' },
      body1Strong: { face: 'primary', size: 'secondary', weight: 'semiBold' },
      body2: { face: 'primary', size: 'body', weight: 'regular' },
      body2Strong: { face: 'primary', size: 'body', weight: 'semiBold' },
      subtitle1: { face: 'primary', size: 'header', weight: 'regular' },
      subtitle1Strong: { face: 'primary', size: 'header', weight: 'semiBold' },
      subtitle2: { face: 'primary', size: 'subheader', weight: 'regular' },
      subtitle2Strong: { face: 'primary', size: 'subheader', weight: 'semiBold' },
      title1: { face: 'primary', size: 'hero', weight: 'regular' },
      title1Strong: { face: 'primary', size: 'hero', weight: 'semiBold' },
      largeTitle: { face: 'primary', size: 'heroLarge', weight: 'regular' },
      display: { face: 'primary', size: 'heroLarge', weight: 'semiBold' },
    } as Variants,
  };

  if (Platform.OS === 'macos' || Platform.OS === 'ios') {
    typography.families = {
      primary: 'System',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      numeric: 'System',
      sansSerif: 'System',
      serif: 'System',
    };
  }

  defaultTypography = typography;
  return typography;
}

function getDefaultSpacing(): Spacing {
  defaultSpacing ??= {
    s2: '4px',
    s1: '8px',
    m: '16px',
    l1: '20px',
    l2: '32px',
  };
  return defaultSpacing;
}

/**
 * Returns a complete legacy Theme without constructing any other appearance.
 * The result is stable for one resolved appearance and safe to use as an
 * immutable base for Flex-to-legacy projection.
 */
export function getDefaultLegacyTheme(appearance: ResolvedThemeAppearance): Theme {
  const key = themeAppearanceKey(appearance);
  const cached = defaultThemes.get(key);
  if (cached) {
    return cached;
  }

  const highContrast = appearance.contrast === 'highContrast';
  const dark = appearance.colorScheme === 'dark';
  const darkAppearance = appearance.interfaceLevel === 'elevated' ? 'darkElevated' : 'dark';
  const colors = highContrast ? getStockWebHighContrastPalette() : dark ? getStockWebDarkPalette(darkAppearance) : getStockWebPalette();
  const tokenAppearance = highContrast ? 'highContrast' : dark ? 'dark' : 'light';
  const theme: Theme = {
    colors,
    typography: getDefaultTypography(),
    spacing: getDefaultSpacing(),
    shadows: createLegacyShadowAliasTokens(tokenAppearance),
    components: {},
    host: {
      appearance: appearanceOptionFromResolved(appearance),
    },
  };

  defaultThemes.set(key, theme);
  return theme;
}
