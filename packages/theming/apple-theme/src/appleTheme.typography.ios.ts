import { FontSize, FontSizes, FontWeightValue, Spacing, Typography, Variants } from '@fluentui-react-native/theme-types';

// The sizes are taken for the Dynamic Type Size "Large", which is the system default
export function appleTypography(): Typography {
  const appleDict = {
    sizes: {
      caption: 12 as FontSize, // Caption 1
      secondary: 16 as FontSize, // Callout
      body: 17 as FontSize, // Body
      subheader: 15 as FontSize, // Subhead
      header: 17 as FontSize, // Headline
      hero: 28 as FontSize, /// Title 1
      heroLarge: 34 as FontSize, // Large Title,
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
      captionStandard: { face: 'primary', size: 'caption', weight: '500' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: '400' },
      secondarySemibold: { face: 'primary', size: 'secondary', weight: '600' },
      bodyStandard: { face: 'primary', size: 'body', weight: '400' },
      bodySemibold: { face: 'primary', size: 'body', weight: '600' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: '400' },
      subheaderSemibold: { face: 'primary', size: 'subheader', weight: '600' },
      headerStandard: { face: 'primary', size: 'header', weight: '400' },
      headerSemibold: { face: 'primary', size: 'header', weight: '600' },
      heroStandard: { face: 'primary', size: 'hero', weight: '400' },
      heroSemibold: { face: 'primary', size: 'hero', weight: '600' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: '400' },
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: '600' },
    } as Variants,
  };

  return appleDict;
}

export function appleSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}
