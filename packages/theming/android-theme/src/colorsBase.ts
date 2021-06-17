import { ColorValue } from 'react-native';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

export interface BaseColors {
  white: ColorValue;
  gray20: ColorValue;
  gray25: ColorValue;
  gray30: ColorValue;
  gray40: ColorValue;
  gray50: ColorValue;
  gray100: ColorValue;
  gray200: ColorValue;
  gray300: ColorValue;
  gray400: ColorValue;
  gray500: ColorValue;
  gray600: ColorValue;
  gray700: ColorValue;
  gray800: ColorValue;
  gray900: ColorValue;
  gray950: ColorValue;
  black: ColorValue;

  blue10: ColorValue;
  blueMagenta20: ColorValue;
  blueMagenta30: ColorValue;
  cyan20: ColorValue;
  cyan30: ColorValue;
  cyanBlue10: ColorValue;
  cyanBlue20: ColorValue;
  magenta10: ColorValue;
  magenta20: ColorValue;
  magentaPink10: ColorValue;
  orange20: ColorValue;
  orange30: ColorValue;
  orangeYellow20: ColorValue;
  pinkRed10: ColorValue;
  red10: ColorValue;
  red20: ColorValue;
}

export interface VariantColors {
  variant: string;
  communicationBlue: ColorValue;
  communicationBlueShade10: ColorValue;
  communicationBlueShade20: ColorValue;
  communicationBlueShade30: ColorValue;
  communicationBlueTint10: ColorValue;
  communicationBlueTint20: ColorValue;
  communicationBlueTint30: ColorValue;
  communicationBlueTint40: ColorValue;

  dangerPrimary: ColorValue;
  dangerShade10: ColorValue;
  dangerShade20: ColorValue;
  dangerShade30: ColorValue;
  dangerTint10: ColorValue;
  dangerTint20: ColorValue;
  dangerTint30: ColorValue;
  dangerTint40: ColorValue;
  successPrimary: ColorValue;
  successShade10: ColorValue;
  successShade20: ColorValue;
  successShade30: ColorValue;
  successTint10: ColorValue;
  successTint20: ColorValue;
  successTint30: ColorValue;
  successTint40: ColorValue;
  warningPrimary: ColorValue;
  warningShade10: ColorValue;
  warningShade20: ColorValue;
  warningShade30: ColorValue;
  warningTint10: ColorValue;
  warningTint20: ColorValue;
  warningTint30: ColorValue;
  warningTint40: ColorValue;
}

export type AndroidBaseColorsPalette = BaseColors & VariantColors;

export const baseColors: BaseColors = {
  white: globalTokens.color.white,
  gray20: globalTokens.color.platinum.primary,
  gray25: globalTokens.color.mink.tint60,
  gray30: globalTokens.color.beige.primary,
  gray40: globalTokens.color.charcoal.primary,
  gray50: '#F1F1F1',
  gray100: '#E1E1E1',
  gray200: '#C8C8C8',
  gray300: '#ACACAC',
  gray400: '#919191',
  gray500: '#6E6E6E',
  gray600: '#404040',
  gray700: '#303030',
  gray800: globalTokens.color.grey[16],
  gray900: '#212121',
  gray950: globalTokens.color.grey[8],
  black: globalTokens.color.black,

  blue10: globalTokens.color.cornflower.primary,
  blueMagenta20: globalTokens.color.orchid.primary,
  blueMagenta30: globalTokens.color.purple.primary,
  cyan20: globalTokens.color.teal.primary,
  cyan30: globalTokens.color.steel.primary,
  cyanBlue10: globalTokens.color.blue.primary,
  cyanBlue20: globalTokens.color.royalBlue.primary,
  magenta10: globalTokens.color.berry.primary,
  magenta20: globalTokens.color.grape.primary,
  magentaPink10: globalTokens.color.hotPink.primary,
  orange20: globalTokens.color.pumpkin.primary,
  orange30: globalTokens.color.brown.primary,
  orangeYellow20: globalTokens.color.brass.primary,
  pinkRed10: globalTokens.color.darkRed.primary,
  red10: globalTokens.color.red.primary,
  red20: globalTokens.color.burgundy.primary,
};

export const androidPaletteLight: AndroidBaseColorsPalette = {
  variant: 'light',
  ...baseColors,
  communicationBlue: globalTokens.color.brand.primary,
  communicationBlueShade10: globalTokens.color.brand.shade10,
  communicationBlueShade20: globalTokens.color.brand.shade20,
  communicationBlueShade30: globalTokens.color.brand.shade40,
  communicationBlueTint10: '#2B88D8',
  communicationBlueTint20: globalTokens.color.brand.tint40,
  communicationBlueTint30: globalTokens.color.brand.tint50,
  communicationBlueTint40: globalTokens.color.brand.tint60,
  dangerPrimary: '#D92C2C',
  dangerShade10: '#C32727',
  dangerShade20: '#A52121',
  dangerShade30: '#791818',
  dangerTint10: '#DD4242',
  dangerTint20: '#E87979',
  dangerTint30: '#F4B9B9',
  dangerTint40: '#F9D9D9',
  successPrimary: globalTokens.color.lightGreen.primary,
  successShade10: globalTokens.color.lightGreen.shade10,
  successShade20: globalTokens.color.lightGreen.shade20,
  successShade30: globalTokens.color.lightGreen.shade30,
  successTint10: globalTokens.color.lightGreen.tint10,
  successTint20: globalTokens.color.lightGreen.tint30,
  successTint30: globalTokens.color.lightGreen.tint40,
  successTint40: globalTokens.color.lightGreen.tint50,
  warningPrimary: '#FFD335',
  warningShade10: '#E6BE30',
  warningShade20: '#C2A129',
  warningShade30: '#8F761E',
  warningTint10: '#FFD94E',
  warningTint20: '#FFE586',
  warningTint30: '#FFF2C3',
  warningTint40: '#FFF8DF',
};

export const androidPaletteDark: AndroidBaseColorsPalette = {
  variant: 'dark',
  ...baseColors,
  communicationBlue: '#0086F0',
  communicationBlueShade10: '#1890F1',
  communicationBlueShade20: globalTokens.color.brand.tint20,
  communicationBlueShade30: globalTokens.color.brand.tint30,
  communicationBlueTint10: globalTokens.color.brand.primary,
  communicationBlueTint20: globalTokens.color.brand.shade30,
  communicationBlueTint30: globalTokens.color.brand.shade50,
  communicationBlueTint40: globalTokens.color.brand.shade60,
  dangerPrimary: '#E83A3A',
  dangerShade10: '#EA4C4C',
  dangerShade20: '#EE6666',
  dangerShade30: '#F28C8C',
  dangerTint10: '#CC3333',
  dangerTint20: '#8B2323',
  dangerTint30: '#461111',
  dangerTint40: '#250909',
  successPrimary: '#FFC328',
  successShade10: '#FFC83E',
  successShade20: '#FFDD15',
  successShade30: '#FFDD87',
  successTint10: '#E0AB24',
  successTint20: '#997518',
  successTint30: '#4D3A0C',
  successTint40: '#291F07',
  warningPrimary: '#0EB244',
  warningShade10: '#20BA53',
  warningShade20: '#3BC569',
  warningShade30: '#67D48B',
  warningTint10: '#0D9D3D',
  warningTint20: '#096B29',
  warningTint30: '#043615',
  warningTint40: '#021D0B',
};

export function getAndroidPalette(appearance: 'light' | 'dark') {
  return appearance == 'dark' ? androidPaletteDark : androidPaletteLight;
}
