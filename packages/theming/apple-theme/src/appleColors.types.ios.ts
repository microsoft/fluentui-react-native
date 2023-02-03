import type { ColorValue } from 'react-native';

// TODO: remove and replace with Fluent 2 alias color tokens
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

// TODO: remove and replace with Fluent 2 alias color tokens
/** FluentUI Apple Colors defined for the iOS Button */
interface FluentAppleButtonColors {
  buttonBackgroundFilledPressed: ColorValue;
  buttonTitleDisabled: ColorValue;
}

export type ApplePalette = FluentUIApplePalette & FluentAppleButtonColors;
