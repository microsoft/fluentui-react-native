import { Palette, FabricWebPalette, ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

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
    warningText: !isInverted ? globalTokens.color.grey['20'] : globalTokens.color.white,
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

export function getStockWebPalette(): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors({
      black: globalTokens.color.black,
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
      white: globalTokens.color.white,
      // Shared Colors
      red: globalTokens.color.red.primary,
      redDark: globalTokens.color.burgundy.primary,

      themeDarker: globalTokens.color.brand.shade40,
      themeDark: globalTokens.color.brand.shade20,
      themeDarkAlt: globalTokens.color.brand.shade10,
      themePrimary: globalTokens.color.brand.primary,
      themeSecondary: '#2b88d8',
      themeTertiary: '#71afe5',
      themeLight: globalTokens.color.brand.tint40,
      themeLighter: globalTokens.color.brand.tint50,
      themeLighterAlt: globalTokens.color.brand.tint60,
      accent: globalTokens.color.brand.primary,
      blackTranslucent40: 'rgba(0,0,0,.4)',
    }),
  };
}

export function getStockWebDarkPalette(): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors(
      {
        // colors taken from fluentui DarkCustomizations.ts
        themeDarker: '#82c7ff',
        themeDark: globalTokens.color.brand.tint30,
        themeDarkAlt: globalTokens.color.brand.tint20,
        themePrimary: globalTokens.color.brand.tint10,
        themeSecondary: globalTokens.color.brand.primary,
        themeTertiary: '#235a85',
        themeLight: globalTokens.color.brand.shade30,
        themeLighter: globalTokens.color.brand.shade50,
        themeLighterAlt: globalTokens.color.brand.shade60,
        black: globalTokens.color.white,
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
        red: globalTokens.color.red.primary,
        accent: globalTokens.color.brand.primary,
        redDark: '#f1707b',
        blackTranslucent40: 'rgba(0,0,0,.4)',
      },
      true,
    ),
  };
}
