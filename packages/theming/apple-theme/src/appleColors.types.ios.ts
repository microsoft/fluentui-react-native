import type { ColorValue } from 'react-native';

/** Palette of colors defined in FluentUI Apple */
interface FluentUIApplePalette {
  communicationBlue: ColorValue;
  communicationBlueTint10: ColorValue;
  communicationBlueTint20: ColorValue;
  communicationBlueTint30: ColorValue;
  dangerPrimary: ColorValue;
  dangerTint10: ColorValue;
  gray20: ColorValue;
  gray30: ColorValue;
  gray40: ColorValue;
  successTint10: ColorValue;
  warningPrimary: ColorValue;
  warningTint10: ColorValue;
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

export type ApplePalette = FluentUIApplePalette & FluentAppleButtonColors;
