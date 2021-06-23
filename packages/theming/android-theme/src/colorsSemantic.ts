import { ColorValue } from 'react-native';
import { AndroidBaseColorsPalette } from './colorsBase';
export interface SemanticPalette {
  // Texts
  textDominant: ColorValue;
  textPrimary: ColorValue;
  textSecondary: ColorValue;
  textDisabled: ColorValue;
  textOnAccent: ColorValue;
  textDominantHighContrast: ColorValue;
  textPrimaryHighContrast: ColorValue;
  textSecondaryHighContrast: ColorValue;
  textDisabledHighContrast: ColorValue;
  textOnAccentHighContrast: ColorValue;

  //  Icons
  iconsPrimary: ColorValue;
  iconsSecondary: ColorValue;
  iconsDisabled: ColorValue;
  iconsOnAccent: ColorValue;
  iconsPrimaryHighContrast: ColorValue;
  iconsSecondaryHighContrast: ColorValue;
  iconsDisabledHighContrast: ColorValue;
  iconsOnAccentHighContrast: ColorValue;

  // Surfaces
  surfacesPrimary: ColorValue;
  surfacesSecondary: ColorValue;
  surfacesTertiary: ColorValue;
  surfacesQuaternary: ColorValue;

  // Dividers
  dividersPrimary: ColorValue;
  dividersSecondary: ColorValue;
  dividersTertiary: ColorValue;

  // Button
  buttonBackground: ColorValue;
  buttonBackgroundPressed: ColorValue;
  buttonBackgroundDisabled: ColorValue;
  buttonTextDisabled: ColorValue;

  // Menu
  menuBackground: ColorValue;
  menuIcon: ColorValue;
  menuItemText: ColorValue;

  // List
  listBackground: ColorValue;

  // HyperLink
  textHyperLink: ColorValue;

  //Checkbox
  checkboxDisabled: ColorValue;
  checkboxBorder: ColorValue;
}

export type FluentUIAndroidPalette = AndroidBaseColorsPalette & SemanticPalette;

export function getFluentUIAndroidPalette(p: AndroidBaseColorsPalette): FluentUIAndroidPalette {
  return p.variant == 'light'
    ? {
        ...p,
        textDominant: p.gray900,
        textPrimary: p.gray900,
        textSecondary: p.gray500,
        textDisabled: p.gray300,
        textOnAccent: p.white,
        textDominantHighContrast: p.black,
        textPrimaryHighContrast: p.black,
        textSecondaryHighContrast: p.gray700,
        textDisabledHighContrast: p.gray500,
        textOnAccentHighContrast: p.white,
        iconsPrimary: p.gray500,
        iconsSecondary: p.gray400,
        iconsDisabled: p.gray300,
        iconsOnAccent: p.white,
        iconsPrimaryHighContrast: p.gray700,
        iconsSecondaryHighContrast: p.gray600,
        iconsDisabledHighContrast: p.gray500,
        iconsOnAccentHighContrast: p.white,
        surfacesPrimary: p.white,
        surfacesSecondary: p.gray25,
        surfacesTertiary: p.gray50,
        surfacesQuaternary: p.gray100,
        dividersPrimary: p.gray100,
        dividersSecondary: p.gray200,
        dividersTertiary: p.gray200,
        buttonBackground: p.communicationBlue,
        buttonBackgroundPressed: p.communicationBlueShade20,
        buttonBackgroundDisabled: p.gray50,
        buttonTextDisabled: p.gray300,
        menuBackground: p.white,
        menuIcon: p.gray400,
        menuItemText: p.gray900,
        listBackground: p.white,
        textHyperLink: '#D83B01',
        checkboxDisabled: p.white,
        checkboxBorder: '#808080',
      }
    : {
        ...p,
        textDominant: p.white,
        textPrimary: p.gray100,
        textSecondary: p.gray400,
        textDisabled: p.gray600,
        textOnAccent: p.black,
        textDominantHighContrast: p.white,
        textPrimaryHighContrast: p.white,
        textSecondaryHighContrast: p.gray200,
        textDisabledHighContrast: p.gray400,
        textOnAccentHighContrast: p.black,
        iconsPrimary: p.white,
        iconsSecondary: p.gray500,
        iconsDisabled: p.gray600,
        iconsOnAccent: p.black,
        iconsPrimaryHighContrast: p.white,
        iconsSecondaryHighContrast: p.gray300,
        iconsDisabledHighContrast: p.gray400,
        iconsOnAccentHighContrast: p.black,
        surfacesPrimary: p.black,
        surfacesSecondary: p.gray950,
        surfacesTertiary: p.gray900,
        surfacesQuaternary: p.gray600,
        dividersPrimary: p.gray800,
        dividersSecondary: p.gray700,
        dividersTertiary: p.gray700,
        buttonBackground: p.communicationBlue,
        buttonBackgroundPressed: p.communicationBlueTint20,
        buttonBackgroundDisabled: p.communicationBlueTint10,
        buttonTextDisabled: p.communicationBlueTint20,
        menuBackground: p.gray800,
        menuIcon: p.gray500,
        menuItemText: p.gray100,
        listBackground: p.gray950,
        textHyperLink: '#D83B01',
        checkboxDisabled: p.black,
        checkboxBorder: '#808080',
      };
}
