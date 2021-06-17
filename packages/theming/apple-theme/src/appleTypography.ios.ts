import { FontSize, FontSizes, FontWeightValue, Typography, Variants } from '@fluentui-react-native/theme-types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

// The sizes are taken for the Dynamic Type Size "Large", which is the system default
export function appleTypography(): Typography {
  const appleDict = {
    sizes: {
      caption: globalTokens.font.size[200] as FontSize, // Caption 2
      secondary: globalTokens.font.size[400] as FontSize, // Caption 1
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
      regular: globalTokens.font.weight.regular as FontWeightValue,
      medium: globalTokens.font.weight.medium as FontWeightValue,
      semiBold: globalTokens.font.weight.semibold as FontWeightValue,
      bold: globalTokens.font.weight.bold as FontWeightValue,
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
    } as Variants,
  };

  return appleDict;
}
