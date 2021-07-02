import { ColorValue } from 'react-native';

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
  white: '#FFFFFF',
  gray20: '#69797E',
  gray25: '#F8F8F8',
  gray30: '#7A7574',
  gray40: '#393939',
  gray50: '#F1F1F1',
  gray100: '#E1E1E1',
  gray200: '#C8C8C8',
  gray300: '#ACACAC',
  gray400: '#919191',
  gray500: '#6E6E6E',
  gray600: '#404040',
  gray700: '#303030',
  gray800: '#292929',
  gray900: '#212121',
  gray950: '#141414',
  black: '#000000',

  blue10: '#4F6BED',
  blueMagenta20: '#8764B8',
  blueMagenta30: '#5C2E91',
  cyan20: '#038387',
  cyan30: '#005B70',
  cyanBlue10: '#0078D4',
  cyanBlue20: '#004E8C',
  magenta10: '#C239B3',
  magenta20: '#881798',
  magentaPink10: '#E3008C',
  orange20: '#CA5010',
  orange30: '#8E562E',
  orangeYellow20: '#986F0B',
  pinkRed10: '#750B1C',
  red10: '#D13438',
  red20: '#A4262C',
};

export const androidPaletteLight: AndroidBaseColorsPalette = {
  variant: 'light',
  ...baseColors,
  communicationBlue: '#0078D4',
  communicationBlueShade10: '#106EBE',
  communicationBlueShade20: '#005A9E',
  communicationBlueShade30: '#004578',
  communicationBlueTint10: '#2B88D8',
  communicationBlueTint20: '#C7E0F4',
  communicationBlueTint30: '#DEECF9',
  communicationBlueTint40: '#EFF6FC',
  dangerPrimary: '#D92C2C',
  dangerShade10: '#C32727',
  dangerShade20: '#A52121',
  dangerShade30: '#791818',
  dangerTint10: '#DD4242',
  dangerTint20: '#E87979',
  dangerTint30: '#F4B9B9',
  dangerTint40: '#F9D9D9',
  successPrimary: '#13A10E',
  successShade10: '#11910D',
  successShade20: '#0F7A0B',
  successShade30: '#0B5A08',
  successTint10: '#27AC22',
  successTint20: '#5EC65A',
  successTint30: '#A7E3A5',
  successTint40: '#CEF0CD',
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
  communicationBlueShade20: '#3AA0F3',
  communicationBlueShade30: '#6CB8F6',
  communicationBlueTint10: '#0078D4',
  communicationBlueTint20: '#004C87',
  communicationBlueTint30: '#043862',
  communicationBlueTint40: '#092C47',
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
