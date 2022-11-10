/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Palette, FabricWebPalette, ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { createColorAliasTokens } from './createAliasTokens';

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
    warningText: !isInverted ? globalTokens.color.grey20 : globalTokens.color.white,
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

    // Control Color Tokens
    defaultBackground: p.neutralLighter,
    defaultBorder: p.neutralSecondaryAlt,
    defaultContent: isInverted ? p.black : p.neutralPrimary,
    defaultIcon: isInverted ? p.black : p.neutralPrimary,

    defaultHoveredBackground: p.neutralLight,
    defaultHoveredBorder: p.neutralSecondaryAlt,
    defaultHoveredContent: isInverted ? p.neutralPrimary : p.neutralDark,
    defaultHoveredIcon: isInverted ? p.neutralPrimary : p.neutralDark,

    defaultFocusedBackground: p.neutralLight,
    defaultFocusedBorder: p.neutralSecondaryAlt,
    defaultFocusedContent: isInverted ? p.neutralPrimary : p.neutralDark,
    defaultFocusedIcon: isInverted ? p.neutralPrimary : p.neutralDark,

    defaultPressedBackground: p.neutralLight,
    defaultPressedBorder: p.neutralSecondaryAlt,
    defaultPressedContent: p.neutralDark,
    defaultPressedIcon: p.neutralDark,

    defaultDisabledBackground: p.neutralLighter,
    defaultDisabledBorder: p.neutralLighter,
    defaultDisabledContent: p.neutralTertiary,
    defaultDisabledIcon: p.neutralTertiary,

    ghostBackground: p.white,
    ghostBorder: p.white,
    ghostContent: p.neutralPrimary,
    ghostIcon: p.neutralPrimary,

    ghostHoveredBackground: p.neutralLighter,
    ghostHoveredBorder: p.neutralLighter,
    ghostHoveredContent: p.neutralDark,
    ghostHoveredIcon: p.neutralDark,

    ghostFocusedBackground: p.neutralLighter,
    ghostFocusedBorder: p.neutralSecondaryAlt,
    ghostFocusedContent: p.neutralDark,
    ghostFocusedIcon: p.neutralDark,

    ghostPressedBackground: p.neutralLight,
    ghostPressedBorder: p.neutralLight,
    ghostPressedContent: p.neutralDark,
    ghostPressedIcon: p.neutralDark,

    ghostDisabledBackground: p.white,
    ghostDisabledBorder: p.white,
    ghostDisabledContent: p.neutralTertiary,
    ghostDisabledIcon: p.neutralTertiary,

    brandedBackground: p.themePrimary,
    brandedBorder: p.themeDark,
    brandedContent: p.white,
    brandedIcon: p.white,

    brandedHoveredBackground: p.themeDarkAlt,
    brandedHoveredBorder: p.themeDarker,
    brandedHoveredContent: p.white,
    brandedHoveredIcon: p.white,

    brandedFocusedBackground: p.themeDarkAlt,
    brandedFocusedBorder: p.themeDarker,
    brandedFocusedContent: p.white,
    brandedFocusedIcon: p.white,

    brandedPressedBackground: p.themeDark,
    brandedPressedBorder: p.themeDarker,
    brandedPressedContent: p.white,
    brandedPressedIcon: p.white,

    brandedDisabledBackground: p.neutralLighter,
    brandedDisabledBorder: p.neutralLighter,
    brandedDisabledContent: p.neutralQuaternary,
    brandedDisabledIcon: p.neutralQuaternary,

    defaultCheckedBackground: p.neutralTertiaryAlt,
    defaultCheckedContent: p.neutralDark,
    defaultCheckedHoveredBackground: p.neutralLight,
    defaultCheckedHoveredContent: isInverted ? p.neutralPrimary : p.neutralDark,

    brandedCheckedBackground: p.neutralTertiaryAlt,
    brandedCheckedContent: p.neutralDark,
    brandedCheckedHoveredBackground: p.neutralLight,
    brandedCheckedHoveredContent: isInverted ? p.neutralPrimary : p.neutralDark,

    ghostCheckedBackground: p.neutralLight,
    ghostCheckedContent: p.black,
    ghostCheckedHoveredBackground: p.neutralLighter,
    ghostCheckedHoveredContent: p.neutralDark,
    ghostCheckedHoveredBorder: p.neutralDark,

    ghostSecondaryContent: p.neutralSecondary,
    ghostFocusedSecondaryContent: p.neutralSecondary,
    ghostHoveredSecondaryContent: p.neutralSecondary,
    ghostPressedSecondaryContent: p.neutralSecondary,

    brandedSecondaryContent: p.neutralLighterAlt,
    brandedFocusedSecondaryContent: p.neutralLighterAlt,
    brandedHoveredSecondaryContent: p.neutralLighterAlt,
    brandedPressedSecondaryContent: p.neutralLighterAlt,

    defaultDisabledSecondaryContent: p.neutralTertiary,
    defaultHoveredSecondaryContent: p.neutralTertiary,
    defaultPressedSecondaryContent: p.neutralTertiary,

    checkmarkColor: p.white,
    checkboxBackground: p.themePrimary,
    checkboxBackgroundDisabled: p.neutralLighter,
    checkboxBorderColor: p.neutralSecondaryAlt,

    personaActivityRing: p.white,
    personaActivityGlow: p.themePrimary,
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

      // @ts-ignore
      accent: globalTokens.color.brand80,
      blackTranslucent40: 'rgba(0,0,0,.4)',

      // Colors to be deprecated
      // @ts-ignore
      themeDarker: globalTokens.color.brand40,
      // @ts-ignore
      themeDark: globalTokens.color.brand60,
      // @ts-ignore
      themeDarkAlt: globalTokens.color.brand70,
      // @ts-ignore
      themePrimary: globalTokens.color.brand80,
      // @ts-ignore
      themeSecondary: globalTokens.color.brand90,
      // @ts-ignore
      themeTertiary: globalTokens.color.brand120,
      // @ts-ignore
      themeLight: globalTokens.color.brand140,
      // @ts-ignore
      themeLighter: globalTokens.color.brand150,
      // @ts-ignore
      themeLighterAlt: globalTokens.color.brand160,
    }),
    ...createColorAliasTokens('light'),
  };
}

export function getStockWebDarkPalette(): ThemeColorDefinition {
  return {
    ...paletteFromFabricColors(
      {
        // colors taken from fluentui DarkCustomizations.ts
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
        // @ts-ignore
        accent: globalTokens.color.brand40,
        redDark: '#f1707b',
        blackTranslucent40: 'rgba(0,0,0,.4)',

        // Colors to be deprecated
        // @ts-ignore
        themeDarker: globalTokens.color.brand110,
        // @ts-ignore
        themeDark: globalTokens.color.brand100,
        // @ts-ignore
        themeDarkAlt: globalTokens.color.brand100,
        // @ts-ignore
        themePrimary: globalTokens.color.brand90,
        // @ts-ignore
        themeSecondary: globalTokens.color.brand90,
        // @ts-ignore
        themeTertiary: globalTokens.color.brand60,
        // @ts-ignore
        themeLight: globalTokens.color.brand50,
        // @ts-ignore
        themeLighter: globalTokens.color.brand40,
        // @ts-ignore
        themeLighterAlt: globalTokens.color.brand30,
      },
      true,
    ),
    ...createColorAliasTokens('dark'),
  };
}

export function getStockWebHCPalette(): ThemeColorDefinition {
  return {
    background: '#000000',
    bodyStandoutBackground: '#000000',
    bodyFrameBackground: '#000000',
    bodyFrameDivider: '#000000',
    bodyText: '#ffffff',
    bodyTextChecked: '#000000',
    subText: '#ffffff',
    bodyDivider: '#ffffff',

    disabledBackground: '#000000',
    disabledText: '#3ff23f',
    disabledBodyText: '#3ff23f',
    disabledSubtext: '#3ff23f',
    disabledBodySubtext: '#3ff23f',

    focusBorder: '#ffffff',
    variantBorder: '#ffffff',
    variantBorderHovered: '#ffffff',
    defaultStateBackground: '#000000',

    errorText: '#ffffff',
    warningText: '#ffffff',
    errorBackground: '#000000',
    blockingBackground: '#000000',
    warningBackground: '#000000',
    warningHighlight: '#ffffff',
    successBackground: '#000000',

    inputBorder: '#ffffff',
    inputBorderHovered: '#1aebff',
    inputBackground: '#000000',
    inputBackgroundChecked: '#1aebff',
    inputBackgroundCheckedHovered: '#1aebff',
    inputForegroundChecked: '#000000',
    inputFocusBorderAlt: '#ffffff',
    smallInputBorder: '#ffffff',
    inputText: '#ffffff',
    inputTextHovered: '#000000',
    inputPlaceholderText: '#ffffff',

    buttonBackground: '#000000',
    buttonBackgroundChecked: '#1aebff',
    buttonBackgroundHovered: '#1aebff',
    buttonBackgroundCheckedHovered: '#1aebff',
    buttonBackgroundPressed: '#1aebff',
    buttonBackgroundDisabled: '#000000',
    buttonBorder: '#ffffff',
    buttonText: '#ffffff',
    buttonTextHovered: '#000000',
    buttonTextChecked: '#000000',
    buttonTextCheckedHovered: '#000000',
    buttonTextPressed: '#000000',
    buttonTextDisabled: '#3ff23f',
    buttonBorderDisabled: '#3ff23f',
    buttonBorderFocused: '#ffffff',

    primaryButtonBackground: '#000000',
    primaryButtonBackgroundHovered: '#1aebff',
    primaryButtonBackgroundPressed: '#1aebff',
    primaryButtonBackgroundDisabled: '#000000',
    primaryButtonBorder: '#ffffff',
    primaryButtonBorderFocused: '#ffffff',
    primaryButtonText: '#ffffff',
    primaryButtonTextHovered: '#000000',
    primaryButtonTextPressed: '#000000',
    primaryButtonTextDisabled: '#3ff23f',

    accentButtonBackground: '#000000',
    accentButtonText: '#ffffff',

    menuBackground: '#000000',
    menuDivider: '#ffffff',
    menuIcon: '#ffffff',
    menuHeader: '#ffffff',
    menuItemBackgroundHovered: '#1aebff',
    menuItemBackgroundPressed: '#1aebff',
    menuItemText: '#ffffff',
    menuItemTextHovered: '#000000',

    listBackground: '#000000',
    listText: '#ffffff',
    listItemBackgroundHovered: '#1aebff',
    listItemBackgroundChecked: '#1aebff',
    listItemBackgroundCheckedHovered: '#1aebff',

    listHeaderBackgroundHovered: '#1aebff',
    listHeaderBackgroundPressed: '#1aebff',

    actionLink: '#ffff00',
    actionLinkHovered: '#ffffff',
    link: '#ffff00',
    linkHovered: '#ffffff',
    linkPressed: '#ffffff',

    // Control Color Tokens
    defaultBackground: '#000000',
    defaultBorder: '#ffffff',
    defaultContent: '#ffffff',
    defaultIcon: '#ffffff',

    defaultHoveredBackground: '#1aebff',
    defaultHoveredBorder: '#1aebff',
    defaultHoveredContent: '#000000',
    defaultHoveredIcon: '#000000',

    defaultFocusedBackground: '#000000',
    defaultFocusedBorder: '#ffffff',
    defaultFocusedContent: '#ffffff',
    defaultFocusedIcon: '#ffffff',

    defaultPressedBackground: '#1aebff',
    defaultPressedBorder: '#1aebff',
    defaultPressedContent: '#000000',
    defaultPressedIcon: '#000000',

    defaultDisabledBackground: '#000000',
    defaultDisabledBorder: '#3ff23f',
    defaultDisabledContent: '#3ff23f',
    defaultDisabledIcon: '#3ff23f',

    ghostBackground: '#000000',
    ghostBorder: '#000000',
    ghostContent: '#ffffff',
    ghostIcon: '#ffffff',

    ghostHoveredBackground: '#1aebff',
    ghostHoveredBorder: '#1aebff',
    ghostHoveredContent: '#000000',
    ghostHoveredIcon: '#000000',

    ghostFocusedBackground: '#000000',
    ghostFocusedBorder: '#ffffff',
    ghostFocusedContent: '#ffffff',
    ghostFocusedIcon: '#ffffff',

    ghostPressedBackground: '#1aebff',
    ghostPressedBorder: '#1aebff',
    ghostPressedContent: '#000000',
    ghostPressedIcon: '#000000',

    ghostDisabledBackground: '#000000',
    ghostDisabledBorder: '#000000',
    ghostDisabledContent: '#3ff23f',
    ghostDisabledIcon: '#3ff23f',

    brandedBackground: '#000000',
    brandedBorder: '#ffffff',
    brandedContent: '#ffffff',
    brandedIcon: '#ffffff',

    brandedHoveredBackground: '#1aebff',
    brandedHoveredBorder: '#1aebff',
    brandedHoveredContent: '#000000',
    brandedHoveredIcon: '#000000',

    brandedFocusedBackground: '#000000',
    brandedFocusedBorder: '#ffffff',
    brandedFocusedContent: '#ffffff',
    brandedFocusedIcon: '#ffffff',

    brandedPressedBackground: '#1aebff',
    brandedPressedBorder: '#1aebff',
    brandedPressedContent: '#000000',
    brandedPressedIcon: '#000000',

    brandedDisabledBackground: '#000000',
    brandedDisabledBorder: '#3ff23f',
    brandedDisabledContent: '#3ff23f',
    brandedDisabledIcon: '#3ff23f',

    defaultCheckedBackground: '#1aebff',
    defaultCheckedContent: '#000000',
    defaultCheckedHoveredBackground: '#1aebff',
    defaultCheckedHoveredContent: '#000000',

    brandedCheckedBackground: '#1aebff',
    brandedCheckedContent: '#000000',
    brandedCheckedHoveredBackground: '#1aebff',
    brandedCheckedHoveredContent: '#000000',

    ghostCheckedBackground: '#1aebff',
    ghostCheckedContent: '#000000',
    ghostCheckedHoveredBackground: '#1aebff',
    ghostCheckedHoveredContent: '#000000',
    ghostCheckedHoveredBorder: '#000000',

    ghostSecondaryContent: '#ffffff',
    ghostFocusedSecondaryContent: '#ffffff',
    ghostHoveredSecondaryContent: '#000000',
    ghostPressedSecondaryContent: '#000000',

    brandedSecondaryContent: '#ffffff',
    brandedFocusedSecondaryContent: '#ffffff',
    brandedHoveredSecondaryContent: '#000000',
    brandedPressedSecondaryContent: '#000000',

    defaultDisabledSecondaryContent: '#ffffff',
    defaultHoveredSecondaryContent: '#000000',
    defaultPressedSecondaryContent: '#000000',

    checkmarkColor: '#ffffff',
    checkboxBackground: '#000000',
    checkboxBackgroundDisabled: '#000000',
    checkboxBorderColor: '#ffffff',

    personaActivityRing: '#ffffff',
    personaActivityGlow: 'transparent', // glow probably doesn't make sense on HC
    ...createColorAliasTokens('highContrast'),
  };
}
