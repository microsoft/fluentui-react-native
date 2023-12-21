/* eslint-disable @typescript-eslint/ban-ts-comment */
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { Palette, FabricWebPalette, ThemeColorDefinition } from '@fluentui-react-native/theme-types';

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

    errorText: !isInverted ? p.redDark : '#ff5f5f',
    warningText: !isInverted ? globalTokens.color.grey20 : globalTokens.color.white,

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

    menuBackground: isInverted ? p.neutralLighter : p.white,
    menuDivider: isInverted ? p.neutralTertiaryAlt : p.neutralTertiaryAlt,
    menuIcon: isInverted ? p.themeDarkAlt : p.themePrimary,
    menuHeader: isInverted ? p.black : p.themePrimary,
    menuItemBackgroundHovered: isInverted ? p.neutralQuaternaryAlt : p.neutralLighter,
    menuItemBackgroundPressed: isInverted ? p.neutralQuaternary : p.neutralLight,
    menuItemText: p.neutralPrimary,
    menuItemTextHovered: p.neutralDark,

    listBackground: p.white,
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

    errorText: '#ffffff',
    warningText: '#ffffff',

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

    menuBackground: '#000000',
    menuDivider: '#ffffff',
    menuIcon: '#ffffff',
    menuHeader: '#ffffff',
    menuItemBackgroundHovered: '#1aebff',
    menuItemBackgroundPressed: '#1aebff',
    menuItemText: '#ffffff',
    menuItemTextHovered: '#000000',

    listBackground: '#000000',
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
