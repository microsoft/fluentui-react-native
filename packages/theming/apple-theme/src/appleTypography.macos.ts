import { FontSize, FontSizes, FontWeightValue, Typography, Variants } from '@fluentui-react-native/theme-types';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { NativeModules } from 'react-native';

/**
 * The Typography is designed to match the styles defined in the Apple HIG:
 * https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/typography/
 * These mappings and variants are subject to change as we moved to a unified cross platform Fluent typography ramp
 */

// const NativeTypographyModule = ensureNativeComponent('MSFAppleThemeModule');

// const module = NativeModules && NativeModules.MSFAppleThemeModule;
// console.warn(module);

const { MSFAppleThemeModule } = NativeModules;
const NativeTypography = MSFAppleThemeModule.getConstants();
console.warn(NativeTypography);

// function fallbackAppleTypography(): Typography {
//   const appleDict = {
//     sizes: {
//       caption: 10 as FontSize, // Caption 1
//       secondary: 11 as FontSize, // Callout
//       body: 13 as FontSize, // Body
//       subheader: 16 as FontSize, // Subheadline
//       header: 20 as FontSize, // Headline
//       hero: 22 as FontSize, /// Title 1
//       heroLarge: 26 as FontSize, // Large Title,
//     } as FontSizes,
//     weights: {
//       ultralight: '100' as FontWeightValue,
//       thin: '200' as FontWeightValue,
//       light: '300' as FontWeightValue,
//       regular: '400' as FontWeightValue,
//       medium: '500' as FontWeightValue,
//       semiBold: '600' as FontWeightValue,
//       bold: '700' as FontWeightValue,
//       heavy: '800' as FontWeightValue,
//       black: '900' as FontWeightValue,
//     },
//     families: {
//       primary: 'SF Pro',
//       secondary: 'System',
//       cursive: 'System',
//       monospace: 'SF Mono',
//       sansSerif: 'SF Pro',
//       serif: 'System',
//     },
//     variants: {
//       captionStandard: { face: 'primary', size: 'caption', weight: '500' },
//       secondaryStandard: { face: 'primary', size: 'secondary', weight: '400' },
//       secondarySemibold: { face: 'primary', size: 'secondary', weight: '600' },
//       bodyStandard: { face: 'primary', size: 'body', weight: '400' },
//       bodySemibold: { face: 'primary', size: 'body', weight: '600' },
//       subheaderStandard: { face: 'primary', size: 'subheader', weight: '400' },
//       subheaderSemibold: { face: 'primary', size: 'subheader', weight: '600' },
//       headerStandard: { face: 'primary', size: 'header', weight: '700' },
//       headerSemibold: { face: 'primary', size: 'header', weight: '800' },
//       heroStandard: { face: 'primary', size: 'hero', weight: '400' },
//       heroSemibold: { face: 'primary', size: 'hero', weight: '700' },
//       heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: '400' },
//       heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: '700' },
//     } as Variants,
//   };

//   return appleDict;
// }

export function appleTypography(): Typography {
  // if (NativeTypography) {
  return NativeTypography;
  // } else {
  //   console.warn('Apple Theme Native Module not found, falling back to JS constants');
  //   return fallbackAppleTypography();
  // }
}
