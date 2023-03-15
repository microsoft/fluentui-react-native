import type { FontSize, FontSizes, FontWeightValue, Typography, Variants } from '@fluentui-react-native/theme-types';

/**
 * The Typography is designed to match the styles defined in the Apple HIG:
 * https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/typography/
 * These mappings and variants are subject to change as we moved to a unified cross platform Fluent typography ramp
 * Github #598 also tracks pulling these values from a Native Module rather than hardcoding the numbers in JS.
 */

export function fallbackAppleTypography(): Typography {
  const appleDict = {
    sizes: {
      caption: 10 as FontSize, // Caption 1
      secondary: 11 as FontSize, // Callout
      body: 13 as FontSize, // Body
      subheader: 16 as FontSize, // Subheadline
      header: 20 as FontSize, // Headline
      hero: 22 as FontSize, /// Title 1
      heroLarge: 26 as FontSize, // Large Title,
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
      numeric: 'System',
      sansSerif: 'System',
      serif: 'System',
    },
    variants: {
      captionStandard: { face: 'primary', size: 'caption', weight: '500' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: '400' },
      secondarySemibold: { face: 'primary', size: 'secondary', weight: '600' },
      bodyStandard: { face: 'primary', size: 'body', weight: '400' },
      bodySemibold: { face: 'primary', size: 'body', weight: '600' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: '400' },
      subheaderSemibold: { face: 'primary', size: 'subheader', weight: '600' },
      headerStandard: { face: 'primary', size: 'header', weight: '700' },
      headerSemibold: { face: 'primary', size: 'header', weight: '800' },
      heroStandard: { face: 'primary', size: 'hero', weight: '400' },
      heroSemibold: { face: 'primary', size: 'hero', weight: '700' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: '400' },
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: '700' },
      // mocked out
      caption1: { face: 'primary', size: 'caption', weight: '500' },
      body1: { face: 'primary', size: 'secondary', weight: '400' },
      body1Strong: { face: 'primary', size: 'secondary', weight: '600' },
      body2: { face: 'primary', size: 'body', weight: '400' },
      body2Strong: { face: 'primary', size: 'body', weight: '600' },
      subtitle1: { face: 'primary', size: 'header', weight: '700' },
      subtitle1Strong: { face: 'primary', size: 'header', weight: '800' },
      subtitle2: { face: 'primary', size: 'subheader', weight: '400' },
      subtitle2Strong: { face: 'primary', size: 'subheader', weight: '600' },
      title1: { face: 'primary', size: 'hero', weight: '400' },
      title1Strong: { face: 'primary', size: 'hero', weight: '700' },
      largeTitle: { face: 'primary', size: 'heroLarge', weight: '400' },
      display: { face: 'primary', size: 'heroLarge', weight: '700' },
    } as Variants,
  };

  return appleDict;
}
