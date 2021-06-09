import { ColorValue } from 'react-native';

/** Palette of colors defined in FluentUI Apple */
interface FluentUIApplePalette {
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
interface FluentAppleSemanticColors {
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

/** FluentUI Apple Colors defined for the iOS Button */
interface FluentAppleButtonColors {
  buttonBackground: ColorValue;
  buttonBackgroundFilledPressed: ColorValue;
  buttonBackgroundFilledDisabled: ColorValue;
  buttonBorderDisabled: ColorValue;
  buttonTitleDisabled: ColorValue;
  buttonTitleWithFilledBackground: ColorValue;
}

export type ApplePalette = FluentUIApplePalette & FluentAppleSemanticColors & FluentAppleButtonColors;
