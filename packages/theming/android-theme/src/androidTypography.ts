import { FontSize, FontSizes, FontWeightValue, Typography, Variants } from '@fluentui-react-native/theme-types';

/**
 * The primary font used in Fluent Android is Roboto as in [Figma](https://www.figma.com/file/MkkE13z6zALstwLlbczIMXrA/Fluent-Android?node-id=7455%3A94)
 * The other fontFamily equivalents are filled from available React Native fonts for Android. Weights are defined from Figma.
 */

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
      light: '300' as FontWeightValue,
      regular: '400' as FontWeightValue,
      medium: '500' as FontWeightValue,
      semiBold: '500' as FontWeightValue,
    },
    families: {
      primary: 'Roboto',
      secondary: 'System',
      cursive: 'System',
      monospace: 'monospace',
      sansSerif: 'sans-serif',
      serif: 'serif',
    },
    variants: {
      captionStandard: { face: 'primary', size: 'caption', weight: '400' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: '400' },
      secondarySemibold: { face: 'primary', size: 'secondary', weight: '500' },
      bodyStandard: { face: 'primary', size: 'body', weight: '400' },
      bodySemibold: { face: 'primary', size: 'body', weight: '500' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: '400' },
      subheaderSemibold: { face: 'primary', size: 'subheader', weight: '500' },
      headerStandard: { face: 'primary', size: 'header', weight: '400' },
      headerSemibold: { face: 'primary', size: 'header', weight: '500' },
      heroStandard: { face: 'primary', size: 'hero', weight: '400' },
      heroSemibold: { face: 'primary', size: 'hero', weight: '500' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: '400' },
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: '500' },
    } as Variants,
  };

  return androidDict;
}
