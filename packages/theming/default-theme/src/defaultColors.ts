import { Palette, FabricWebPalette, ThemeColorDefinition, ColorRamp } from '@fluentui-react-native/theme-types';

/**
 * Generate a palette from a set of fabric web colors, like those output from the theme designer.
 *
 * @param palette - fabric web palette definition.  This allows initializing our color values in the same
 * manner the fabric web does it
 */
export function paletteFromFabricColors(p: FabricWebPalette, isInverted?: boolean): Palette {
  return {
    background: p.white,
    bodyStandoutBackground: p.neutralLighterAlt,
    bodyFrameBackground: p.white,
    bodyFrameDivider: p.neutralLight,
    bodyText: p.neutralPrimary,
    bodyTextChecked: p.black,
    subText: p.neutralSecondary,
    bodyDivider: p.neutralLight,

    disabledBackground: isInverted ? p.neutralQuaternaryAlt : p.neutralLighter,
    disabledText: p.neutralTertiary,
    disabledBodyText: p.neutralTertiary,
    disabledSubtext: p.neutralQuaternary,
    disabledBodySubtext: p.neutralTertiaryAlt,

    focusBorder: p.neutralSecondary,
    variantBorder: p.neutralLight,
    variantBorderHovered: p.neutralTertiary,
    defaultStateBackground: p.neutralLighterAlt,

    errorText: !isInverted ? p.redDark : '#ff5f5f',
    warningText: !isInverted ? '#333333' : '#ffffff',
    errorBackground: !isInverted ? 'rgba(245, 135, 145, .2)' : 'rgba(232, 17, 35, .5)',
    blockingBackground: !isInverted ? 'rgba(250, 65, 0, .2)' : 'rgba(234, 67, 0, .5)',
    warningBackground: !isInverted ? 'rgba(255, 200, 10, .2)' : 'rgba(255, 251, 0, .6)',
    warningHighlight: !isInverted ? '#ffb900' : '#fff100',
    successBackground: !isInverted ? 'rgba(95, 210, 85, .2)' : 'rgba(186, 216, 10, .4)',

    inputBorder: p.neutralTertiary,
    inputBorderHovered: p.neutralPrimary,
    inputBackground: p.white,
    inputBackgroundChecked: p.themePrimary,
    inputBackgroundCheckedHovered: p.themeDarkAlt,
    inputForegroundChecked: p.white,
    inputFocusBorderAlt: p.themePrimary,
    smallInputBorder: p.neutralSecondary,
    inputText: p.neutralPrimary,
    inputTextHovered: p.neutralDark,
    inputPlaceholderText: p.neutralSecondary,

    buttonBackground: p.neutralLighter,
    buttonBackgroundChecked: p.neutralTertiaryAlt,
    buttonBackgroundHovered: p.neutralLight,
    buttonBackgroundCheckedHovered: p.neutralLight,
    buttonBackgroundPressed: p.neutralLight,
    buttonBackgroundDisabled: p.neutralLighter,
    buttonBorder: p.neutralSecondaryAlt,
    buttonText: isInverted ? p.black : p.neutralPrimary,
    buttonTextHovered: isInverted ? p.neutralPrimary : p.neutralDark,
    buttonTextChecked: p.neutralDark,
    buttonTextCheckedHovered: p.black,
    buttonTextPressed: p.neutralDark,
    buttonTextDisabled: p.neutralTertiary,
    buttonBorderDisabled: p.neutralLighter,
    buttonBorderFocused: p.neutralSecondaryAlt,

    primaryButtonBackground: p.themePrimary,
    primaryButtonBackgroundHovered: p.themeDarkAlt,
    primaryButtonBackgroundPressed: p.themeDark,
    primaryButtonBackgroundDisabled: p.neutralLighter,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: p.white,
    primaryButtonTextHovered: p.white,
    primaryButtonTextPressed: p.white,
    primaryButtonTextDisabled: p.neutralQuaternary,

    accentButtonBackground: p.accent,
    accentButtonText: p.white,

    menuBackground: isInverted ? p.neutralLighter : p.white,
    menuDivider: isInverted ? p.neutralTertiaryAlt : p.neutralTertiaryAlt,
    menuIcon: isInverted ? p.themeDarkAlt : p.themePrimary,
    menuHeader: isInverted ? p.black : p.themePrimary,
    menuItemBackgroundHovered: isInverted ? p.neutralQuaternaryAlt : p.neutralLighter,
    menuItemBackgroundPressed: isInverted ? p.neutralQuaternary : p.neutralLight,
    menuItemText: p.neutralPrimary,
    menuItemTextHovered: p.neutralDark,

    listBackground: p.white,
    listText: p.neutralPrimary,
    listItemBackgroundHovered: p.neutralLighter,
    listItemBackgroundChecked: p.neutralLight,
    listItemBackgroundCheckedHovered: p.neutralQuaternaryAlt,

    listHeaderBackgroundHovered: p.neutralLighter,
    listHeaderBackgroundPressed: p.neutralLight,

    actionLink: p.neutralPrimary,
    actionLinkHovered: p.neutralDark,
    link: p.themePrimary,
    linkHovered: p.themeDarker,
    linkPressed: p.themeDark,
  };
}

const defaultColorRamp: ColorRamp = {
  values: [],
  index: -1,
};

export function getStockWebPalette(): ThemeColorDefinition {
  return {
    brand: defaultColorRamp,
    neutral: defaultColorRamp,
    warning: defaultColorRamp,
    ...paletteFromFabricColors({
      black: '#000000',
      neutralDark: '#201f1e',
      neutralPrimary: '#323130',
      neutralPrimaryAlt: '#3b3a39',
      neutralSecondary: '#605e5c',
      neutralSecondaryAlt: '#8a8886',
      neutralTertiary: '#a19f9d',
      neutralTertiaryAlt: '#c8c6c4',
      neutralQuaternary: '#d2d0ce',
      neutralQuaternaryAlt: '#e1dfdd',
      neutralLight: '#edebe9',
      neutralLighter: '#f3f2f1',
      neutralLighterAlt: '#faf9f8',
      white: '#ffffff',
      // Shared Colors
      red: '#d13438',
      redDark: '#a4262c',

      themeDarker: '#004578',
      themeDark: '#005a9e',
      themeDarkAlt: '#106ebe',
      themePrimary: '#0078d4',
      themeSecondary: '#2b88d8',
      themeTertiary: '#71afe5',
      themeLight: '#c7e0f4',
      themeLighter: '#deecf9',
      themeLighterAlt: '#eff6fc',
      accent: '#0078d4',
      blackTranslucent40: 'rgba(0,0,0,.4)',
    }),
  };
}

export function getStockWebDarkPalette(): ThemeColorDefinition {
  return {
    brand: defaultColorRamp,
    neutral: defaultColorRamp,
    warning: defaultColorRamp,
    ...paletteFromFabricColors(
      {
        // colors takesn from fluentui DarkCustomizations.ts
        themeDarker: '#82c7ff',
        themeDark: '#6cb8f6',
        themeDarkAlt: '#3aa0f3',
        themePrimary: '#2899f5',
        themeSecondary: '#0078d4',
        themeTertiary: '#235a85',
        themeLight: '#004c87',
        themeLighter: '#043862',
        themeLighterAlt: '#092c47',
        black: '#ffffff',
        neutralDark: '#faf9f8',
        neutralPrimary: '#f3f2f1',
        neutralPrimaryAlt: '#c8c6c4',
        neutralSecondary: '#a19f9d',
        neutralSecondaryAlt: '#979693',
        neutralTertiary: '#797775',
        neutralTertiaryAlt: '#484644',
        neutralQuaternary: '#3b3a39',
        neutralQuaternaryAlt: '#323130',
        neutralLight: '#292827',
        neutralLighter: '#252423',
        neutralLighterAlt: '#201f1e',
        white: '#1b1a19',
        red: '#d13438',
        accent: '#0078d4',
        redDark: '#F1707B',
        blackTranslucent40: 'rgba(0,0,0,.4)',
      },
      true,
    ),
  };
}
