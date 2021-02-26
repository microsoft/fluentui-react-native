import { ColorValue } from '@fluentui-react-native/theme-types';
import { DynamicColorIOS } from 'react-native';

/** Palette of colors defined in FluentUI Apple */
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
   * In Darkmode, our system use two sets of background colors -- called base and elevated -- to enhance the perception of depath when one dark interface is layered above another.
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

export type ApplePalette = FluentApplePalette & FluentAppleSemanticColors;

export function getFluentUIApplePalette(): ApplePalette {
  return {
    blue10: '#4F6BED',
    blueMagenta20: '#8764B8',
    blueMagenta30: '#5C2E91',
    communicationBlue: DynamicColorIOS({
      light: '#0078D4',
      dark: '#1890F1',
    }),
    communicationBlueShade10: DynamicColorIOS({
      light: '#106EBE',
      dark: '#1890F1',
    }),
    communicationBlueShade20: DynamicColorIOS({
      light: '#005A9E',
      dark: '#3AA0F3',
    }),
    communicationBlueShade30: DynamicColorIOS({
      light: '#004578',
      dark: '#6CB8F6',
    }),
    communicationBlueTint10: DynamicColorIOS({
      light: '#2B88D8',
      dark: '#0078D4',
    }),
    communicationBlueTint20: DynamicColorIOS({
      light: '#C7E0F4',
      dark: '#004C87',
    }),
    communicationBlueTint30: DynamicColorIOS({
      light: '#DEECF9',
      dark: '#043862',
    }),
    communicationBlueTint40: DynamicColorIOS({
      light: '#EFF6FC',
      dark: '#092C47',
    }),

    cyan20: '#038387',
    cyan30: '#005B70',
    cyanBlue10: '#0078D4',
    cyanBlue20: '#004E8C',
    dangerPrimary: DynamicColorIOS({
      light: '#D92C2C',
      dark: '#clear',
    }),
    dangerShade10: DynamicColorIOS({
      light: '#C32727',
      dark: '#clear',
    }),
    dangerShade20: DynamicColorIOS({
      light: '#A52121',
      dark: '#clear',
    }),
    dangerShade30: DynamicColorIOS({
      light: '#791818',
      dark: '#clear',
    }),
    dangerTint10: DynamicColorIOS({
      light: '#DD4242',
      dark: '#clear',
    }),
    dangerTint20: DynamicColorIOS({
      light: '#E87979',
      dark: '#clear',
    }),
    dangerTint30: DynamicColorIOS({
      light: '#F4B9B9',
      dark: '#clear',
    }),
    dangerTint40: DynamicColorIOS({
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
    presenceAvailable: DynamicColorIOS({
      light: '#6BB700',
      dark: '#92C353',
    }),
    presenceAway: DynamicColorIOS({
      light: '#FFAA44',
      dark: '#F8D22A',
    }),
    presenceBlocked: DynamicColorIOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceBusy: DynamicColorIOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceDnd: DynamicColorIOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceOffline: DynamicColorIOS({
      light: '#8A8886',
      dark: '#979593',
    }),
    presenceOof: DynamicColorIOS({
      light: '#B4009E',
      dark: '#E959D9',
    }),
    presenceUnknown: DynamicColorIOS({
      light: '#8A8886',
      dark: '#979593',
    }),
    red10: '#D13438',
    red20: '#A4262C',
    successPrimary: DynamicColorIOS({
      light: '#13A10E',
      dark: '#979593',
    }),
    successShade10: DynamicColorIOS({
      light: '#11910D',
      dark: '#20BA53',
    }),
    successShade20: DynamicColorIOS({
      light: '#0F7A0B',
      dark: '#3BC569',
    }),
    successShade30: DynamicColorIOS({
      light: '#0B5A08',
      dark: '#67D48B',
    }),
    successTint10: DynamicColorIOS({
      light: '#27AC22',
      dark: '#0D9D3D',
    }),
    successTint20: DynamicColorIOS({
      light: '#5EC65A',
      dark: '#096B29',
    }),
    successTint30: DynamicColorIOS({
      light: '#A7E3A5',
      dark: '#043615',
    }),
    successTint40: DynamicColorIOS({
      light: '#CEF0CD',
      dark: '#021D0B',
    }),
    warningPrimary: DynamicColorIOS({
      light: '#FFD335',
      dark: '#FFC328',
    }),
    warningShade10: DynamicColorIOS({
      light: '#E6BE30',
      dark: '#FFC83E',
    }),
    warningShade20: DynamicColorIOS({
      light: '#C2A129',
      dark: '#FFDD15',
    }),
    warningShade30: DynamicColorIOS({
      light: '#8F761E',
      dark: '#FFDD87',
    }),
    warningTint10: DynamicColorIOS({
      light: '#FFD94E',
      dark: '#E0AB24',
    }),
    warningTint20: DynamicColorIOS({
      light: '#FFE586',
      dark: '#997518',
    }),
    warningTint30: DynamicColorIOS({
      light: '#FFF2C3',
      dark: '#4D3A0C',
    }),
    warningTint40: DynamicColorIOS({
      light: '#FFF8DF',
      dark: '#291F07',
    }),

    textDominant: 'clear', //= UIColor(light: gray900, lightHighContrast: .black, dark: .white)
    textPrimary: 'clear', //= UIColor(light: gray900, lightHighContrast: .black, dark: gray100, darkHighContrast: .white)
    textSecondary: 'clear', //= UIColor(light: gray500, lightHighContrast: gray700, dark: gray400, darkHighContrast: gray200)
    textDisabled: 'clear', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    textOnAccent: 'clear', //= UIColor(light: .white, dark: .black)

    iconPrimary: 'clear', //= UIColor(light: gray500, lightHighContrast: gray700, dark: .white)
    iconSecondary: 'clear', //= UIColor(light: gray400, lightHighContrast: gray600, dark: gray500, darkHighContrast: gray300, darkElevated: gray400)
    iconDisabled: 'clear', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    iconOnAccent: 'clear', //= UIColor(light: .white, dark: .black)

    surfacePrimary: 'clear', //= UIColor(light: .white, dark: .black, darkElevated: gray950)
    surfaceSecondary: 'clear', //= UIColor(light: gray25, dark: gray950, darkElevated: gray900)
    surfaceTertiary: 'clear', //= UIColor(light: gray50, dark: gray900, darkElevated: gray800)
    surfaceQuaternary: 'clear', //= UIColor(light: gray100, dark: gray600)

    dividerOnPrimary: 'clear', //= UIColor(light: gray100, dark: gray800, darkElevated: gray700)
    dividerOnSecondary: 'clear', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
    dividerOnTertiary: 'clear', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
  };
}
