import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { ThemeColorDefinition } from '@fluentui-react-native/theme-types';

import { createColorAliasTokens } from './createAliasTokens';

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
    ...createColorAliasTokens('light'),
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
