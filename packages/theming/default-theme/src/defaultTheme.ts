import { Theme, Typography, Spacing, Effects, FontWeightValue, FontSize, FontSizes, Variants } from '@fluentui-react-native/theme-types';
import { Platform } from 'react-native';
import { getStockWebPalette, getStockWebDarkPalette } from './defaultColors';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

function _defaultTypography(): Typography {
  const defaultsDict = {
    sizes: {
      caption: globalTokens.font.size['100'] as FontSize,
      secondary: globalTokens.font.size['200'] as FontSize,
      body: globalTokens.font.size['300'] as FontSize,
      subheader: globalTokens.font.size['400'] as FontSize,
      header: globalTokens.font.size['500'] as FontSize,
      hero: globalTokens.font.size['700'] as FontSize,
      heroLarge: 42 as FontSize,
    } as FontSizes,
    weights: {
      regular: globalTokens.font.weight.regular as FontWeightValue,
      semiBold: globalTokens.font.weight.semibold as FontWeightValue,
    },
    families: {
      primary: 'Segoe UI',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
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
    } as Variants,
  };

  if (Platform.OS === 'macos' || Platform.OS === 'ios') {
    const familiesDictApple = {
      primary: 'System',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System',
    };
    defaultsDict.families = familiesDictApple;
  }

  // In certain cases on win32, semibold font renders incorrectly so 'Segoe UI Semibold' is used
  if (Platform.OS === ('win32' as any)) {
    const familiesDictWin32 = {
      primary: 'Segoe UI',
      secondary: 'Segoe UI Semibold',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System',
    };
    defaultsDict.families = familiesDictWin32;

    const variantsDictWin32 = {
      captionStandard: { face: 'primary', size: 'caption', weight: 'regular' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: 'regular' },
      secondarySemibold: { face: 'secondary', size: 'secondary', weight: 'semiBold' },
      bodyStandard: { face: 'primary', size: 'body', weight: 'regular' },
      bodySemibold: { face: 'secondary', size: 'body', weight: 'semiBold' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: 'regular' },
      subheaderSemibold: { face: 'secondary', size: 'subheader', weight: 'semiBold' },
      headerStandard: { face: 'primary', size: 'header', weight: 'regular' },
      headerSemibold: { face: 'secondary', size: 'header', weight: 'semiBold' },
      heroStandard: { face: 'primary', size: 'hero', weight: 'regular' },
      heroSemibold: { face: 'secondary', size: 'hero', weight: 'semiBold' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: 'regular' },
      heroLargeSemibold: { face: 'secondary', size: 'heroLarge', weight: 'semiBold' },
    } as Variants;
    defaultsDict.variants = variantsDictWin32;
  }

  return defaultsDict;
}

export function defaultEffects(): Effects {
  const effects =
    Platform.OS === 'android' || Platform.OS === 'ios'
      ? {
          borderRadiusSmall: 2,
          borderRadiusMedium: 4,
          borderRadiusLarge: 8,
          borderRadiusXLarge: 12,
        }
      : {
          borderRadiusSmall: 2,
          borderRadiusMedium: 4,
          borderRadiusLarge: 6,
          borderRadiusXLarge: 8,
        };

  const noOffset = { width: 0, height: 0 };
  const nearShadowAmbient =
    Platform.OS === 'ios' ? { shadowOffset: noOffset, shadowRadius: 1 } : { shadowOffset: noOffset, shadowRadius: 2 };
  const farShadowAmbient =
    Platform.OS === 'ios' ? { shadowOffset: noOffset, shadowRadius: 4 } : { shadowOffset: noOffset, shadowRadius: 8 };
  Object.assign(
    effects,
    ((Platform.OS === 'ios' || Platform.OS === 'windows' || Platform.OS === ('win32' as any) || Platform.OS === 'web') && {
      shadow2Ambient: nearShadowAmbient,
      shadow2Key: { shadowOffset: { width: 0, height: 1 }, shadowRadius: Platform.OS === 'ios' ? 1 : 2 },

      shadow4Ambient: nearShadowAmbient,
      shadow4Key: { shadowOffset: { width: 0, height: 2 }, shadowRadius: Platform.OS === 'ios' ? 2 : 4 },

      shadow8Ambient: nearShadowAmbient,
      shadow8Key: { shadowOffset: { width: 0, height: 4 }, shadowRadius: Platform.OS === 'ios' ? 4 : 8 },

      shadow16Ambient: nearShadowAmbient,
      shadow16Key: { shadowOffset: { width: 0, height: 8 }, shadowRadius: Platform.OS === 'ios' ? 8 : 16 },

      shadow28Ambient: farShadowAmbient,
      shadow28Key: { shadowOffset: { width: 0, height: 14 }, shadowRadius: Platform.OS === 'ios' ? 14 : 28 },

      shadow64Ambient: farShadowAmbient,
      shadow64Key: { shadowOffset: { width: 0, height: 32 }, shadowRadius: Platform.OS === 'ios' ? 32 : 64 },
    }) ||
      ((Platform.OS === 'android' || Platform.OS === 'macos') && {
        shadow2Ambient: undefined,
        shadow2Key: undefined,

        shadow4Ambient: undefined,
        shadow4Key: undefined,

        shadow8Ambient: undefined,
        shadow8Key: undefined,

        shadow16Ambient: undefined,
        shadow16Key: undefined,

        shadow28Ambient: undefined,
        shadow28Key: undefined,

        shadow64Ambient: undefined,
        shadow64Key: undefined,
      }),
  );
  return effects as Effects;
}

export function defaultSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export const defaultFluentTheme: Theme = {
  colors: getStockWebPalette(),
  typography: _defaultTypography(),
  spacing: defaultSpacing(),
  effects: defaultEffects(),
  components: {},
  host: { appearance: 'light' },
};

export const defaultFluentDarkTheme: Theme = {
  colors: getStockWebDarkPalette(),
  typography: defaultFluentTheme.typography,
  spacing: defaultFluentTheme.spacing,
  effects: defaultFluentTheme.effects,
  components: {},
  host: { appearance: 'dark' },
};
