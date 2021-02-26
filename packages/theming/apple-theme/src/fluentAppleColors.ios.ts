import { ColorValue } from '@fluentui-react-native/theme-types';

/** Palette of colors defined in FluentUI Apple */
export interface FluentUIApplePalette {
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

/** A set of colors that define semantic colors in FluentUI Apple */
export interface FluentAppleSemanticColors {
  /**
   * text color should not be lower than `gray500` in light mode to achieve 4.5:1 minimum contrast ratio in `.white` background
   * text color should not be higher than `gray400` in dark mode to achieve 4.5:1 minimum contrast ratio in `.black` background
   * when determining high contrast color, add 200 in light mode and substract 200 in dark mode from the default color.
   * text color used for main level in the screen. eg. title in dialog, title in navigationbar with `surfacePrimary`, etc
   */

  /** text color used for main level in the screen. eg. title in dialog, title in navigationbar with `surfacePrimary`, etc */
  textDominant: ColorValue; //= UIColor(light: gray900, lightHighContrast: .black, dark: .white)
  /** text color used for titles */
  textPrimary: ColorValue; //= UIColor(light: gray900, lightHighContrast: .black, dark: gray100, darkHighContrast: .white)
  /** text color used for subtitles */
  textSecondary: ColorValue; //= UIColor(light: gray500, lightHighContrast: gray700, dark: gray400, darkHighContrast: gray200)
  /** text color used in disabled state */
  textDisabled: ColorValue; //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
  /** text appears on top of the surface that uses `Colors.primary` as background color */
  textOnAccent: ColorValue; //= UIColor(light: .white, dark: .black)

  /** icon used as call-to-actions without a label attached. They need to reach a minimum contrast ratio 4.5:1 to its background */
  iconPrimary: ColorValue; //= UIColor(light: gray500, lightHighContrast: gray700, dark: .white)
  /** icon that are attached to a label and are only used for decorative purposes */
  iconSecondary: ColorValue; //= UIColor(light: gray400, lightHighContrast: gray600, dark: gray500, darkHighContrast: gray300, darkElevated: gray400)
  /** icon color used in disabled state */
  iconDisabled: ColorValue; //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
  /** icon appears on top of surfaces that uses `Colors.primary` as background color */
  iconOnAccent: ColorValue; //= UIColor(light: .white, dark: .black)

  /**
   * In Dark mode, our system use two sets of background colors -- called base and elevated -- to enhance the perception of depth when one dark interface is layered above another.
   * The dark base colors are darker, making background interface appear to recede, and the elevate colors are lighter, making foreground interfaces appear to advance
   */

  surfacePrimary: ColorValue; //= UIColor(light: .white, dark: .black, darkElevated: gray950)
  surfaceSecondary: ColorValue; //= UIColor(light: gray25, dark: gray950, darkElevated: gray900)
  surfaceTertiary: ColorValue; //= UIColor(light: gray50, dark: gray900, darkElevated: gray800)
  /** also used for disabled background color */
  surfaceQuaternary: ColorValue; //= UIColor(light: gray100, dark: gray600)

  dividerOnPrimary: ColorValue; //= UIColor(light: gray100, dark: gray800, darkElevated: gray700)
  dividerOnSecondary: ColorValue; //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
  dividerOnTertiary: ColorValue; //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
}

export type ApplePalette = FluentUIApplePalette & FluentAppleSemanticColors;

export function getFluentUIAppleLightPalette(): ApplePalette {
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

    textDominant: '#212121', //= UIColor(light: gray900, lightHighContrast: .black, dark: .white)
    textPrimary: '#212121', //= UIColor(light: gray900, lightHighContrast: .black, dark: gray100, darkHighContrast: .white)
    textSecondary: '#6E6E6E', //= UIColor(light: gray500, lightHighContrast: gray700, dark: gray400, darkHighContrast: gray200)
    textDisabled: '#ACACAC', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    textOnAccent: 'white', //= UIColor(light: .white, dark: .black)

    iconPrimary: '#6E6E6E', //= UIColor(light: gray500, lightHighContrast: gray700, dark: .white)
    iconSecondary: '#919191', //= UIColor(light: gray400, lightHighContrast: gray600, dark: gray500, darkHighContrast: gray300, darkElevated: gray400)
    iconDisabled: '#ACACAC', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    iconOnAccent: 'white', //= UIColor(light: .white, dark: .black)

    surfacePrimary: 'white', //= UIColor(light: .white, dark: .black, darkElevated: gray950)
    surfaceSecondary: '#F8F8F8', //= UIColor(light: gray25, dark: gray950, darkElevated: gray900)
    surfaceTertiary: '#F1F1F1', //= UIColor(light: gray50, dark: gray900, darkElevated: gray800)
    surfaceQuaternary: '#E1E1E1', //= UIColor(light: gray100, dark: gray600)

    dividerOnPrimary: '#E1E1E1', //= UIColor(light: gray100, dark: gray800, darkElevated: gray700)
    dividerOnSecondary: '#C8C8C8', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
    dividerOnTertiary: '#C8C8C8', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
  };
}

export function getFluentUIAppleDarkPalette(): ApplePalette {
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

    textDominant: 'white', //= UIColor(light: gray900, lightHighContrast: .black, dark: .white)
    textPrimary: '#E1E1E1', //= UIColor(light: gray900, lightHighContrast: .black, dark: gray100, darkHighContrast: .white)
    textSecondary: '#919191', //= UIColor(light: gray500, lightHighContrast: gray700, dark: gray400, darkHighContrast: gray200)
    textDisabled: '#404040', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    textOnAccent: 'black', //= UIColor(light: .white, dark: .black)

    iconPrimary: '#303030', //= UIColor(light: gray500, lightHighContrast: gray700, dark: .white)
    iconSecondary: '#404040', //= UIColor(light: gray400, lightHighContrast: gray600, dark: gray500, darkHighContrast: gray300, darkElevated: gray400)
    iconDisabled: '#6E6E6E', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    iconOnAccent: 'black', //= UIColor(light: .white, dark: .black)

    surfacePrimary: 'black', //= UIColor(light: .white, dark: .black, darkElevated: gray950)
    surfaceSecondary: '#141414', //= UIColor(light: gray25, dark: gray950, darkElevated: gray900)
    surfaceTertiary: '#212121', //= UIColor(light: gray50, dark: gray900, darkElevated: gray800)
    surfaceQuaternary: '#404040', //= UIColor(light: gray100, dark: gray600)

    dividerOnPrimary: '#292929', //= UIColor(light: gray100, dark: gray800, darkElevated: gray700)
    dividerOnSecondary: '#303030', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
    dividerOnTertiary: '#303030', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
  };
}
