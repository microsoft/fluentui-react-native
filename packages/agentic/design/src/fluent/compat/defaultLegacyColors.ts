import type { FabricWebPalette, Palette, ThemeColorDefinition } from '../types/Color.types';

import { createLegacyColorAliasTokens } from './createLegacyAliasTokens';

export function paletteFromFabricColors(palette: FabricWebPalette, isInverted?: boolean): Palette {
  return {
    background: palette.white,
    bodyStandoutBackground: palette.neutralLighterAlt,
    bodyFrameBackground: palette.white,
    bodyFrameDivider: palette.neutralLight,
    bodyText: palette.neutralPrimary,
    bodyTextChecked: palette.black,
    subText: palette.neutralSecondary,
    bodyDivider: palette.neutralLight,

    disabledBackground: isInverted ? palette.neutralQuaternaryAlt : palette.neutralLighter,
    disabledText: palette.neutralTertiary,
    disabledBodyText: palette.neutralTertiary,

    focusBorder: palette.neutralSecondary,
    variantBorder: palette.neutralLight,

    errorText: !isInverted ? palette.redDark : '#ff5f5f',
    inputBorder: palette.neutralTertiary,
    inputBackground: palette.white,
    inputFocusBorderAlt: palette.themePrimary,
    inputText: palette.neutralPrimary,
    inputPlaceholderText: palette.neutralSecondary,

    buttonBackground: palette.neutralLighter,
    buttonBackgroundChecked: palette.neutralTertiaryAlt,
    buttonBackgroundHovered: palette.neutralLight,
    buttonBackgroundPressed: palette.neutralLight,
    buttonBackgroundDisabled: palette.neutralLighter,
    buttonBorder: palette.neutralSecondaryAlt,
    buttonText: isInverted ? palette.black : palette.neutralPrimary,
    buttonTextHovered: isInverted ? palette.neutralPrimary : palette.neutralDark,
    buttonTextChecked: palette.neutralDark,
    buttonTextPressed: palette.neutralDark,
    buttonTextDisabled: palette.neutralTertiary,
    buttonBorderDisabled: palette.neutralLighter,
    buttonBorderFocused: palette.neutralSecondaryAlt,

    primaryButtonBackground: palette.themePrimary,
    primaryButtonBackgroundHovered: palette.themeDarkAlt,
    primaryButtonBackgroundPressed: palette.themeDark,
    primaryButtonBackgroundDisabled: palette.neutralLighter,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: palette.white,
    primaryButtonTextHovered: palette.white,
    primaryButtonTextPressed: palette.white,
    primaryButtonTextDisabled: palette.neutralQuaternary,

    accentButtonBackground: palette.accent,

    menuBackground: isInverted ? palette.neutralLighter : palette.white,
    menuDivider: palette.neutralTertiaryAlt,
    menuIcon: isInverted ? palette.themeDarkAlt : palette.themePrimary,
    menuItemBackgroundHovered: isInverted ? palette.neutralQuaternaryAlt : palette.neutralLighter,
    menuItemBackgroundPressed: isInverted ? palette.neutralQuaternary : palette.neutralLight,
    menuItemText: palette.neutralPrimary,
    menuItemTextHovered: palette.neutralDark,

    listHeaderBackgroundHovered: palette.neutralLighter,
    listHeaderBackgroundPressed: palette.neutralLight,

    actionLink: palette.neutralPrimary,
    link: palette.themePrimary,
    linkHovered: palette.themeDarker,
    linkPressed: palette.themeDark,

    defaultBackground: palette.neutralLighter,
    defaultBorder: palette.neutralSecondaryAlt,
    defaultContent: isInverted ? palette.black : palette.neutralPrimary,
    defaultIcon: isInverted ? palette.black : palette.neutralPrimary,

    defaultHoveredBackground: palette.neutralLight,
    defaultHoveredBorder: palette.neutralSecondaryAlt,
    defaultHoveredContent: isInverted ? palette.neutralPrimary : palette.neutralDark,
    defaultHoveredIcon: isInverted ? palette.neutralPrimary : palette.neutralDark,

    defaultFocusedBackground: palette.neutralLight,
    defaultFocusedBorder: palette.neutralSecondaryAlt,
    defaultFocusedContent: isInverted ? palette.neutralPrimary : palette.neutralDark,
    defaultFocusedIcon: isInverted ? palette.neutralPrimary : palette.neutralDark,

    defaultPressedBackground: palette.neutralLight,
    defaultPressedBorder: palette.neutralSecondaryAlt,
    defaultPressedContent: palette.neutralDark,
    defaultPressedIcon: palette.neutralDark,

    defaultDisabledBackground: palette.neutralLighter,
    defaultDisabledBorder: palette.neutralLighter,
    defaultDisabledContent: palette.neutralTertiary,
    defaultDisabledIcon: palette.neutralTertiary,

    ghostBackground: palette.white,
    ghostBorder: palette.white,
    ghostContent: palette.neutralPrimary,
    ghostIcon: palette.neutralPrimary,

    ghostHoveredBackground: palette.neutralLighter,
    ghostHoveredBorder: palette.neutralLighter,
    ghostHoveredContent: palette.neutralDark,
    ghostHoveredIcon: palette.neutralDark,

    ghostFocusedBackground: palette.neutralLighter,
    ghostFocusedBorder: palette.neutralSecondaryAlt,
    ghostFocusedContent: palette.neutralDark,
    ghostFocusedIcon: palette.neutralDark,

    ghostPressedBackground: palette.neutralLight,
    ghostPressedBorder: palette.neutralLight,
    ghostPressedContent: palette.neutralDark,
    ghostPressedIcon: palette.neutralDark,

    ghostDisabledBackground: palette.white,
    ghostDisabledBorder: palette.white,
    ghostDisabledContent: palette.neutralTertiary,
    ghostDisabledIcon: palette.neutralTertiary,

    brandedBackground: palette.themePrimary,
    brandedDisabledBorder: palette.neutralLighter,

    defaultCheckedBackground: palette.neutralTertiaryAlt,
    defaultCheckedContent: palette.neutralDark,
    defaultCheckedHoveredBackground: palette.neutralLight,
    defaultCheckedHoveredContent: isInverted ? palette.neutralPrimary : palette.neutralDark,

    ghostCheckedBackground: palette.neutralLight,
    ghostCheckedContent: palette.black,
    ghostCheckedHoveredBackground: palette.neutralLighter,
    ghostCheckedHoveredContent: palette.neutralDark,
    ghostCheckedHoveredBorder: palette.neutralDark,

    ghostSecondaryContent: palette.neutralSecondary,
    ghostFocusedSecondaryContent: palette.neutralSecondary,
    ghostHoveredSecondaryContent: palette.neutralSecondary,
    ghostPressedSecondaryContent: palette.neutralSecondary,

    brandedSecondaryContent: palette.neutralLighterAlt,
    brandedFocusedSecondaryContent: palette.neutralLighterAlt,
    brandedHoveredSecondaryContent: palette.neutralLighterAlt,
    brandedPressedSecondaryContent: palette.neutralLighterAlt,

    defaultHoveredSecondaryContent: palette.neutralTertiary,
    defaultPressedSecondaryContent: palette.neutralTertiary,

    checkmarkColor: palette.white,
    checkboxBackground: palette.themePrimary,
    checkboxBackgroundDisabled: palette.neutralLighter,
    checkboxBorderColor: palette.neutralSecondaryAlt,

    personaActivityRing: palette.white,
    personaActivityGlow: palette.themePrimary,
  };
}

export function getStockWebHighContrastPalette(): ThemeColorDefinition {
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

    focusBorder: '#ffffff',
    variantBorder: '#ffffff',

    errorText: '#ffffff',

    inputBorder: '#ffffff',
    inputBackground: '#000000',
    inputFocusBorderAlt: '#ffffff',
    inputText: '#ffffff',
    inputPlaceholderText: '#ffffff',

    buttonBackground: '#000000',
    buttonBackgroundChecked: '#1aebff',
    buttonBackgroundHovered: '#1aebff',
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
    menuItemBackgroundHovered: '#1aebff',
    menuItemBackgroundPressed: '#1aebff',
    menuItemText: '#ffffff',
    menuItemTextHovered: '#000000',

    listHeaderBackgroundHovered: '#1aebff',
    listHeaderBackgroundPressed: '#1aebff',

    actionLink: '#ffff00',
    link: '#ffff00',
    linkHovered: '#ffffff',
    linkPressed: '#ffffff',

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
    brandedDisabledBorder: '#3ff23f',

    defaultCheckedBackground: '#1aebff',
    defaultCheckedContent: '#000000',
    defaultCheckedHoveredBackground: '#1aebff',
    defaultCheckedHoveredContent: '#000000',

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

    defaultHoveredSecondaryContent: '#000000',
    defaultPressedSecondaryContent: '#000000',

    checkmarkColor: '#ffffff',
    checkboxBackground: '#000000',
    checkboxBackgroundDisabled: '#000000',
    checkboxBorderColor: '#ffffff',

    personaActivityRing: '#ffffff',
    personaActivityGlow: 'transparent',
    ...createLegacyColorAliasTokens('highContrast'),
  };
}
