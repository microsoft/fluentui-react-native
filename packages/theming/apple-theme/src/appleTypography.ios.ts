import globalTokens from '@fluentui-react-native/design-tokens-ios/light/tokens-global.json';

import { FontSize, FontSizes, FontWeightValue, Typography, Variants } from '@fluentui-react-native/theme-types';

const fontTokens = globalTokens.font;

// The sizes are taken for the Dynamic Type Size "Large", which is the system default
export function appleTypography(): Typography {
  const appleDict = {
    sizes: {
      caption: 12 as FontSize, // Caption 2
      secondary: 16 as FontSize, // Caption 1
      body: 17 as FontSize, // Body
      subheader: 15 as FontSize, // Subhead
      header: 17 as FontSize, // Headline
      hero: 26 as FontSize, /// Title 1
      heroLarge: 30 as FontSize, // Large Title,
    } as FontSizes,
    weights: {
      ultralight: '100' as FontWeightValue,
      thin: '200' as FontWeightValue,
      light: '300' as FontWeightValue,
      regular: '400' as FontWeightValue,
      medium: '500' as FontWeightValue,
      semiBold: '600' as FontWeightValue,
      bold: '700' as FontWeightValue,
      heavy: '800' as FontWeightValue,
      black: '900' as FontWeightValue,
    },
    families: {
      primary: 'System',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System',
    },
    variants: {
      captionStandard: { face: 'primary', size: 'caption', weight: '400' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: '400' },
      secondarySemibold: { face: 'primary', size: 'secondary', weight: '600' },
      bodyStandard: { face: 'primary', size: 'body', weight: '400' },
      bodySemibold: { face: 'primary', size: 'body', weight: '600' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: '400' },
      subheaderSemibold: { face: 'primary', size: 'subheader', weight: '600' },
      headerStandard: { face: 'primary', size: 'header', weight: '600' },
      headerSemibold: { face: 'primary', size: 'header', weight: '800' },
      heroStandard: { face: 'primary', size: 'hero', weight: '400' },
      heroSemibold: { face: 'primary', size: 'hero', weight: '600' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: '400' },
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: '600' },
      // iOS styles
      caption2: {
        face: fontTokens.family.base,
        size: fontTokens.size100,
        weight: fontTokens.weight.regular,
        lineHeight: fontTokens.lineHeight100,
        letterSpacing: 0,
      },
      caption1: {
        face: fontTokens.family.base,
        size: fontTokens.size200,
        weight: fontTokens.weight.regular,
        lineHeight: fontTokens.lineHeight200,
        letterSpacing: -0.08,
      },
      caption1Strong: {
        face: fontTokens.family.base,
        size: fontTokens.size200,
        weight: fontTokens.weight.semibold,
        lineHeight: fontTokens.lineHeight200,
        letterSpacing: -0.08,
      },
      body2: {
        face: fontTokens.family.base,
        size: fontTokens.size300,
        weight: fontTokens.weight.regular,
        lineHeight: fontTokens.lineHeight300,
        letterSpacing: -0.23,
      },
      body2Strong: {
        face: fontTokens.family.base,
        size: fontTokens.size300,
        weight: fontTokens.weight.semibold,
        lineHeight: fontTokens.lineHeight300,
        letterSpacing: -0.23,
      },
      body1: {
        face: fontTokens.family.base,
        size: fontTokens.size400,
        weight: fontTokens.weight.regular,
        lineHeight: fontTokens.lineHeight400,
        letterSpacing: -0.43,
      },
      body1Strong: {
        face: fontTokens.family.base,
        size: fontTokens.size400,
        weight: fontTokens.weight.semibold,
        lineHeight: fontTokens.lineHeight400,
        letterSpacing: -0.43,
      },
      title3: {
        face: fontTokens.family.base,
        size: fontTokens.size500,
        weight: fontTokens.weight.semibold,
        lineHeight: fontTokens.lineHeight500,
        letterSpacing: -0.45,
      },
      title2: {
        face: fontTokens.family.base,
        size: fontTokens.size600,
        weight: fontTokens.weight.semibold,
        lineHeight: fontTokens.lineHeight600,
        letterSpacing: -0.26,
      },
      title1: {
        face: fontTokens.family.base,
        size: fontTokens.size700,
        weight: fontTokens.weight.bold,
        lineHeight: fontTokens.lineHeight700,
        letterSpacing: 0.38,
      },
      largeTitle: {
        face: fontTokens.family.base,
        size: fontTokens.size800,
        weight: fontTokens.weight.bold,
        lineHeight: fontTokens.lineHeight800,
        letterSpacing: 0.4,
      },
      display: {
        face: fontTokens.family.base,
        size: fontTokens.size900,
        weight: fontTokens.weight.bold,
        lineHeight: fontTokens.lineHeight900,
        letterSpacing: 0.26,
      },
    } as Variants,
  };

  return appleDict;
}
