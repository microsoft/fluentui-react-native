import { ColorValue } from '@fluentui-react-native/theme-types';
import { DynamicColorMacOS } from 'react-native';

// Palette of FluentUI Apple Colors
export interface FluentApplePalette {
  blue10: ColorValue;
  blueMagenta20: ColorValue;
  blueMagenta30: ColorValue;
  communicationBlue: ColorValue;
  communicationBlueShade10: ColorValue;
  communicationBlueShade20: ColorValue;
  communicationBlueShade30: ColorValue;
  communicationBlueTint10: ColorValue;
  communicationBlueTint20: ColorValue;
  communicationBlueTint30: ColorValue;
  communicationBlueTint40: ColorValue;
  cyan20: ColorValue;
  cyan30: ColorValue;
  cyanBlue10: ColorValue;
  cyanBlue20: ColorValue;
  dangerPrimary: ColorValue;
  dangerShade10: ColorValue;
  dangerShade20: ColorValue;
  dangerShade30: ColorValue;
  dangerTint10: ColorValue;
  dangerTint20: ColorValue;
  dangerTint30: ColorValue;
  dangerTint40: ColorValue;
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
  green10: ColorValue;
  green20: ColorValue;
  magenta10: ColorValue;
  magenta20: ColorValue;
  magentaPink10: ColorValue;
  orange20: ColorValue;
  orange30: ColorValue;
  orangeYellow20: ColorValue;
  pinkRed10: ColorValue;
  presenceAvailable: ColorValue;
  presenceAway: ColorValue;
  presenceBlocked: ColorValue;
  presenceBusy: ColorValue;
  presenceDnd: ColorValue;
  presenceOffline: ColorValue;
  presenceOof: ColorValue;
  presenceUnknown: ColorValue;
  red10: ColorValue;
  red20: ColorValue;
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

export interface FluentAppleButtonTokens {
  brandBackgroundDisabled: ColorValue;
  brandForegroundDisabled: ColorValue;
  neutralBackground2: ColorValue;
  neutralBackground3: ColorValue;
  neutralForeground2: ColorValue;
  neutralForeground3: ColorValue;
  neutralInverted: ColorValue;
  neutralStroke2: ColorValue;
}

export type ApplePalette = FluentApplePalette & FluentAppleButtonTokens;

export function getStockAppleDynamicPalette(): ApplePalette {
  return {
    blue10: '#4F6BED',
    blueMagenta20: '#8764B8',
    blueMagenta30: '#5C2E91',
    communicationBlue: DynamicColorMacOS({
      light: '#0078D4',
      dark: '#1890F1',
    }),
    communicationBlueShade10: DynamicColorMacOS({
      light: '#106EBE',
      dark: '#1890F1',
    }),
    communicationBlueShade20: DynamicColorMacOS({
      light: '#005A9E',
      dark: '#3AA0F3',
    }),
    communicationBlueShade30: DynamicColorMacOS({
      light: '#004578',
      dark: '#6CB8F6',
    }),
    communicationBlueTint10: DynamicColorMacOS({
      light: '#2B88D8',
      dark: '#0078D4',
    }),
    communicationBlueTint20: DynamicColorMacOS({
      light: '#C7E0F4',
      dark: '#004C87',
    }),
    communicationBlueTint30: DynamicColorMacOS({
      light: '#DEECF9',
      dark: '#043862',
    }),
    communicationBlueTint40: DynamicColorMacOS({
      light: '#EFF6FC',
      dark: '#092C47',
    }),

    cyan20: '#038387',
    cyan30: '#005B70',
    cyanBlue10: '#0078D4',
    cyanBlue20: '#004E8C',
    dangerPrimary: DynamicColorMacOS({
      light: '#D92C2C',
      dark: '#clear',
    }),
    dangerShade10: DynamicColorMacOS({
      light: '#C32727',
      dark: '#clear',
    }),
    dangerShade20: DynamicColorMacOS({
      light: '#A52121',
      dark: '#clear',
    }),
    dangerShade30: DynamicColorMacOS({
      light: '#791818',
      dark: '#clear',
    }),
    dangerTint10: DynamicColorMacOS({
      light: '#DD4242',
      dark: '#clear',
    }),
    dangerTint20: DynamicColorMacOS({
      light: '#E87979',
      dark: '#clear',
    }),
    dangerTint30: DynamicColorMacOS({
      light: '#F4B9B9',
      dark: '#clear',
    }),
    dangerTint40: DynamicColorMacOS({
      light: '#F9D9D9',
      dark: '#clear',
    }),
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
    green10: '#498205',
    green20: '#0B6A0B',
    magenta10: '#C239B3',
    magenta20: '#881798',
    magentaPink10: '#E3008C',
    orange20: '#CA5010',
    orange30: '#8E562E',
    orangeYellow20: '#986F0B',
    pinkRed10: '#750B1C',
    presenceAvailable: DynamicColorMacOS({
      light: '#6BB700',
      dark: '#92C353',
    }),
    presenceAway: DynamicColorMacOS({
      light: '#FFAA44',
      dark: '#F8D22A',
    }),
    presenceBlocked: DynamicColorMacOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceBusy: DynamicColorMacOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceDnd: DynamicColorMacOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceOffline: DynamicColorMacOS({
      light: '#8A8886',
      dark: '#979593',
    }),
    presenceOof: DynamicColorMacOS({
      light: '#B4009E',
      dark: '#E959D9',
    }),
    presenceUnknown: DynamicColorMacOS({
      light: '#8A8886',
      dark: '#979593',
    }),
    red10: '#D13438',
    red20: '#A4262C',
    successPrimary: DynamicColorMacOS({
      light: '#13A10E',
      dark: '#979593',
    }),
    successShade10: DynamicColorMacOS({
      light: '#11910D',
      dark: '#20BA53',
    }),
    successShade20: DynamicColorMacOS({
      light: '#0F7A0B',
      dark: '#3BC569',
    }),
    successShade30: DynamicColorMacOS({
      light: '#0B5A08',
      dark: '#67D48B',
    }),
    successTint10: DynamicColorMacOS({
      light: '#27AC22',
      dark: '#0D9D3D',
    }),
    successTint20: DynamicColorMacOS({
      light: '#5EC65A',
      dark: '#096B29',
    }),
    successTint30: DynamicColorMacOS({
      light: '#A7E3A5',
      dark: '#043615',
    }),
    successTint40: DynamicColorMacOS({
      light: '#CEF0CD',
      dark: '#021D0B',
    }),
    warningPrimary: DynamicColorMacOS({
      light: '#FFD335',
      dark: '#FFC328',
    }),
    warningShade10: DynamicColorMacOS({
      light: '#E6BE30',
      dark: '#FFC83E',
    }),
    warningShade20: DynamicColorMacOS({
      light: '#C2A129',
      dark: '#FFDD15',
    }),
    warningShade30: DynamicColorMacOS({
      light: '#8F761E',
      dark: '#FFDD87',
    }),
    warningTint10: DynamicColorMacOS({
      light: '#FFD94E',
      dark: '#E0AB24',
    }),
    warningTint20: DynamicColorMacOS({
      light: '#FFE586',
      dark: '#997518',
    }),
    warningTint30: DynamicColorMacOS({
      light: '#FFF2C3',
      dark: '#4D3A0C',
    }),
    warningTint40: DynamicColorMacOS({
      light: '#FFF8DF',
      dark: '#291F07',
    }),

    brandBackgroundDisabled: DynamicColorMacOS({
      light: '#252525',
      dark: '#565656',
    }),
    brandForegroundDisabled: DynamicColorMacOS({
      light: '#252525',
      dark: '#FFFFFF',
    }),
    neutralBackground2: DynamicColorMacOS({
      light: '#FFFFFF',
      dark: '#555555',
    }),
    neutralBackground3: DynamicColorMacOS({
      light: '#000000',
      dark: '#555555',
    }),
    neutralForeground2: '#000000',
    neutralForeground3: DynamicColorMacOS({
      light: '#272727',
      dark: '#FFFFFF',
    }),
    neutralInverted: '#FFFFFF',
    neutralStroke2: '#000000',
  };
}

export function getStockAppleLightPalette(): ApplePalette {
  return {
    blue10: '#4F6BED',
    blueMagenta20: '#8764B8',
    blueMagenta30: '#5C2E91',
    communicationBlue: '#0078D4',
    communicationBlueShade10: '#106EBE',
    communicationBlueShade20: '#005A9E',
    communicationBlueShade30: '#004578',
    communicationBlueTint10: '#2B88D8',
    communicationBlueTint20: '#C7E0F4',
    communicationBlueTint30: '#DEECF9',
    communicationBlueTint40: '#EFF6FC',
    cyan20: '#038387',
    cyan30: '#005B70',
    cyanBlue10: '#0078D4',
    cyanBlue20: '#004E8C',
    dangerPrimary: '#D92C2C',
    dangerShade10: '#C32727',
    dangerShade20: '#A52121',
    dangerShade30: '#791818',
    dangerTint10: '#DD4242',
    dangerTint20: '#E87979',
    dangerTint30: '#F4B9B9',
    dangerTint40: '#F9D9D9',
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
    green10: '#498205',
    green20: '#0B6A0B',
    magenta10: '#C239B3',
    magenta20: '#881798',
    magentaPink10: '#E3008C',
    orange20: '#CA5010',
    orange30: '#8E562E',
    orangeYellow20: '#986F0B',
    pinkRed10: '#750B1C',
    presenceAvailable: '#6BB700',
    presenceAway: '#FFAA44',
    presenceBlocked: '#C50F1F',
    presenceBusy: '#C50F1F',
    presenceDnd: '#C50F1F',
    presenceOffline: '#8A8886',
    presenceOof: '#B4009E',
    presenceUnknown: '#8A8886',
    red10: '#D13438',
    red20: '#A4262C',
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

    brandBackgroundDisabled: '#252525',
    brandForegroundDisabled: '#252525',
    neutralBackground2: '#FFFFFF',
    neutralBackground3: '#000000',
    neutralForeground2: '#000000',
    neutralForeground3: '#272727',
    neutralInverted: '#FFFFFF',
    neutralStroke2: '#000000',
  };
}

export function getStockAppleDarkPalette(): ApplePalette {
  return {
    blue10: '#4F6BED',
    blueMagenta20: '#8764B8',
    blueMagenta30: '#5C2E91',
    communicationBlue: '#0086F0',
    communicationBlueShade10: '#1890F1',
    communicationBlueShade20: '#3AA0F3',
    communicationBlueShade30: '#6CB8F6',
    communicationBlueTint10: '#0078D4',
    communicationBlueTint20: '#004C87',
    communicationBlueTint30: '#043862',
    communicationBlueTint40: '#092C47',
    cyan20: '#038387',
    cyan30: '#005B70',
    cyanBlue10: '#0078D4',
    cyanBlue20: '#004E8C',
    dangerPrimary: '#E83A3A',
    dangerShade10: '#EA4C4C',
    dangerShade20: '#EE6666',
    dangerShade30: '#F28C8C',
    dangerTint10: '#CC3333',
    dangerTint20: '#8B2323',
    dangerTint30: '#461111',
    dangerTint40: '#250909',
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
    green10: '#498205',
    green20: '#0B6A0B',
    magenta10: '#C239B3',
    magenta20: '#881798',
    magentaPink10: '#E3008C',
    orange20: '#CA5010',
    orange30: '#8E562E',
    orangeYellow20: '#986F0B',
    pinkRed10: '#750B1C',
    presenceAvailable: '#92C353',
    presenceAway: '#F8D22A',
    presenceBlocked: '#D74553',
    presenceBusy: '#D74553',
    presenceDnd: '#D74553',
    presenceOffline: '#979593',
    presenceOof: '#E959D9',
    presenceUnknown: '#979593',
    red10: '#D13438',
    red20: '#A4262C',
    successPrimary: '#979593',
    successShade10: '#20BA53',
    successShade20: '#3BC569',
    successShade30: '#67D48B',
    successTint10: '#0D9D3D',
    successTint20: '#096B29',
    successTint30: '#043615',
    successTint40: '#021D0B',
    warningPrimary: '#FFC328',
    warningShade10: '#FFC83E',
    warningShade20: '#FFDD15',
    warningShade30: '#FFDD87',
    warningTint10: '#E0AB24',
    warningTint20: '#997518',
    warningTint30: '#4D3A0C',
    warningTint40: '#291F07',

    brandBackgroundDisabled: '#565656',
    brandForegroundDisabled: '#FFFFFF',
    neutralBackground2: '#555555',
    neutralBackground3: '#555555',
    neutralForeground2: '#000000',
    neutralForeground3: '#FFFFFF',
    neutralInverted: '#FFFFFF',
    neutralStroke2: '#000000',
  };
}
