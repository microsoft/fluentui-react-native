import type { FontSize, FontSizes, FontWeightValue, Typography, Variants } from '@fluentui-react-native/theme-types';

import { createFontAliasTokens } from './createFontAliasTokens';

export function androidTypography(): Typography {
  const androidDict = {
    sizes: {
      caption: 12 as FontSize, // Caption
      secondary: 12 as FontSize, // Caption
      body: 14 as FontSize, // Body 1
      subheader: 16 as FontSize, // Subheading 1
      header: 18 as FontSize, // Heading
      hero: 20 as FontSize, // Title 1
      heroLarge: 28 as FontSize, // Headline
    } as FontSizes,
    weights: {
      // The font weights do not work for Android since RN 0.60 (https://github.com/facebook/react-native/issues/25696)
      // The workaround is to use font aliases from android source (https://android.googlesource.com/platform/frameworks/base/+/master/data/fonts/fonts.xml)
      regular: '400' as FontWeightValue,
      semiBold: '500' as FontWeightValue,
    },
    families: {
      primary: 'sans-serif', // sans-serif, weight=400
      primarySemibold: 'sans-serif-medium', // sans-serif, weight=500
      primaryLight: 'sans-serif-light', // sans-serif, weight=300
      secondary: 'System',
      cursive: 'cursive',
      monospace: 'monospace',
      numeric: 'numeric',
      sansSerif: 'sans-serif',
      serif: 'serif',
    },
    variants: {
      captionStandard: { face: 'primary', size: 'caption' },
      secondaryStandard: { face: 'primary', size: 'secondary' },
      secondarySemibold: { face: 'primarySemibold', size: 'secondary' },
      bodyStandard: { face: 'primary', size: 'body' },
      bodySemibold: { face: 'primarySemibold', size: 'body' },
      subheaderStandard: { face: 'primary', size: 'subheader' },
      subheaderSemibold: { face: 'primarySemibold', size: 'subheader' },
      headerStandard: { face: 'primary', size: 'header' },
      headerSemibold: { face: 'primarySemibold', size: 'header' },
      heroStandard: { face: 'primary', size: 'hero' },
      heroSemibold: { face: 'primarySemibold', size: 'hero' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge' },
      heroLargeSemibold: { face: 'primarySemibold', size: 'heroLarge' },
      ...createFontAliasTokens(),
    } as Variants,
  };

  return androidDict;
}
