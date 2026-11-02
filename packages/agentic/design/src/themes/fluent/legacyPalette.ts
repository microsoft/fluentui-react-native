import type { AliasColorTokens, ControlColorTokens, PaletteBackgroundColors, PaletteTextColors } from '../../fluent/types/Color.types';

/**
 * The legacy palette keys that every legacy `Theme` must define.
 */
export type LegacyPalette = PaletteTextColors & PaletteBackgroundColors & ControlColorTokens;

/**
 * Derive the legacy palette from Fluent 2 alias colors. Each legacy name points at the alias token the Fluent 2
 * components use for the same role, so the palette adds no color values of its own. The result is typed as complete,
 * so a legacy key without a mapping fails to compile.
 */
export function legacyPaletteFromAliasColors(a: Required<AliasColorTokens>): LegacyPalette {
  return {
    // Text
    bodyText: a.neutralForeground1,
    bodyTextChecked: a.neutralForeground1Selected,
    subText: a.neutralForeground2,
    actionLink: a.neutralForeground1,
    link: a.brandForegroundLink,
    linkHovered: a.brandForegroundLinkHover,
    linkPressed: a.brandForegroundLinkPressed,
    disabledText: a.neutralForegroundDisabled,
    disabledBodyText: a.neutralForegroundDisabled,
    errorText: a.dangerForeground1,
    inputText: a.neutralForeground1,
    inputPlaceholderText: a.neutralForeground4,
    buttonText: a.neutralForeground1,
    buttonTextHovered: a.neutralForeground1Hover,
    buttonTextChecked: a.neutralForeground1Selected,
    buttonTextPressed: a.neutralForeground1Pressed,
    buttonTextDisabled: a.neutralForegroundDisabled,
    primaryButtonText: a.neutralForegroundOnBrand,
    primaryButtonTextHovered: a.neutralForegroundOnBrandHover,
    primaryButtonTextPressed: a.neutralForegroundOnBrandPressed,
    primaryButtonTextDisabled: a.neutralForegroundDisabled,

    // Backgrounds, borders and dividers
    background: a.neutralBackground1,
    bodyStandoutBackground: a.neutralBackground2,
    bodyFrameBackground: a.neutralBackground1,
    bodyFrameDivider: a.neutralStroke2,
    bodyDivider: a.neutralStroke2,
    disabledBackground: a.neutralBackgroundDisabled,
    focusBorder: a.strokeFocus2,
    variantBorder: a.neutralStroke2,
    inputBorder: a.neutralStroke1,
    inputBackground: a.neutralBackground1,
    inputFocusBorderAlt: a.compoundBrandStroke1,
    buttonBackground: a.neutralBackground1,
    buttonBackgroundChecked: a.neutralBackground1Selected,
    buttonBackgroundHovered: a.neutralBackground1Hover,
    buttonBackgroundDisabled: a.neutralBackgroundDisabled,
    buttonBackgroundPressed: a.neutralBackground1Pressed,
    buttonBorder: a.neutralStroke1,
    buttonBorderFocused: a.strokeFocus2,
    buttonBorderDisabled: a.neutralStrokeDisabled,
    primaryButtonBackground: a.brandBackground,
    primaryButtonBackgroundHovered: a.brandBackgroundHover,
    primaryButtonBackgroundPressed: a.brandBackgroundPressed,
    primaryButtonBackgroundDisabled: a.neutralBackgroundDisabled,
    primaryButtonBorder: a.transparentStroke,
    primaryButtonBorderFocused: a.strokeFocus2,
    accentButtonBackground: a.brandBackground,
    menuBackground: a.neutralBackground1,
    menuDivider: a.neutralStroke2,
    menuIcon: a.neutralForeground2,
    menuItemBackgroundHovered: a.neutralBackground1Hover,
    menuItemBackgroundPressed: a.neutralBackground1Pressed,
    menuItemText: a.neutralForeground1,
    menuItemTextHovered: a.neutralForeground1Hover,
    listHeaderBackgroundHovered: a.neutralBackground1Hover,
    listHeaderBackgroundPressed: a.neutralBackground1Pressed,

    // Default control. Focus keeps the hover fill and content with the focus stroke, as the Fluent 2 Button does.
    defaultBackground: a.neutralBackground1,
    defaultBorder: a.neutralStroke1,
    defaultContent: a.neutralForeground1,
    defaultIcon: a.neutralForeground1,
    defaultHoveredBackground: a.neutralBackground1Hover,
    defaultHoveredBorder: a.neutralStroke1Hover,
    defaultHoveredContent: a.neutralForeground1Hover,
    defaultHoveredIcon: a.neutralForeground1Hover,
    defaultFocusedBackground: a.neutralBackground1Hover,
    defaultFocusedBorder: a.strokeFocus2,
    defaultFocusedContent: a.neutralForeground1Hover,
    defaultFocusedIcon: a.neutralForeground1Hover,
    defaultPressedBackground: a.neutralBackground1Pressed,
    defaultPressedBorder: a.neutralStroke1Pressed,
    defaultPressedContent: a.neutralForeground1Pressed,
    defaultPressedIcon: a.neutralForeground1Pressed,
    defaultDisabledBackground: a.neutralBackgroundDisabled,
    defaultDisabledBorder: a.neutralStrokeDisabled,
    defaultDisabledContent: a.neutralForegroundDisabled,
    defaultDisabledIcon: a.neutralForegroundDisabled,

    // Ghost control, the Fluent 2 subtle appearance
    ghostBackground: a.subtleBackground,
    ghostBorder: a.transparentStroke,
    ghostContent: a.neutralForeground1,
    ghostIcon: a.neutralForeground1,
    ghostHoveredBackground: a.subtleBackgroundHover,
    ghostHoveredBorder: a.transparentStroke,
    ghostHoveredContent: a.neutralForeground1Hover,
    ghostHoveredIcon: a.neutralForeground1Hover,
    ghostFocusedBackground: a.subtleBackgroundHover,
    ghostFocusedBorder: a.strokeFocus2,
    ghostFocusedContent: a.neutralForeground1Hover,
    ghostFocusedIcon: a.neutralForeground1Hover,
    ghostPressedBackground: a.subtleBackgroundPressed,
    ghostPressedBorder: a.transparentStroke,
    ghostPressedContent: a.neutralForeground1Pressed,
    ghostPressedIcon: a.neutralForeground1Pressed,
    ghostDisabledBackground: a.subtleBackground,
    ghostDisabledBorder: a.transparentStrokeDisabled,
    ghostDisabledContent: a.neutralForegroundDisabled,
    ghostDisabledIcon: a.neutralForegroundDisabled,

    // Branded control
    brandedBackground: a.brandBackground,
    brandedDisabledBorder: a.transparentStrokeDisabled,
    brandedSecondaryContent: a.neutralForegroundOnBrand,
    brandedFocusedSecondaryContent: a.neutralForegroundOnBrandHover,
    brandedHoveredSecondaryContent: a.neutralForegroundOnBrandHover,
    brandedPressedSecondaryContent: a.neutralForegroundOnBrandPressed,

    // Checked control
    defaultCheckedBackground: a.neutralBackground1Selected,
    defaultCheckedContent: a.neutralForeground1Selected,
    defaultCheckedHoveredBackground: a.neutralBackground1Hover,
    defaultCheckedHoveredContent: a.neutralForeground1Hover,
    ghostCheckedBackground: a.subtleBackgroundSelected,
    ghostCheckedContent: a.neutralForeground2Selected,
    ghostCheckedHoveredBackground: a.subtleBackgroundHover,
    ghostCheckedHoveredContent: a.neutralForeground2Hover,
    ghostCheckedHoveredBorder: a.transparentStroke,

    // Secondary content
    ghostSecondaryContent: a.neutralForeground3,
    ghostFocusedSecondaryContent: a.neutralForeground3,
    ghostHoveredSecondaryContent: a.neutralForeground3Hover,
    ghostPressedSecondaryContent: a.neutralForeground3Pressed,
    defaultHoveredSecondaryContent: a.neutralForeground3Hover,
    defaultPressedSecondaryContent: a.neutralForeground3Pressed,

    // Checkbox and persona
    checkboxBackground: a.compoundBrandBackground1,
    checkboxBackgroundDisabled: a.neutralBackgroundDisabled,
    checkmarkColor: a.neutralForegroundOnBrand,
    checkboxBorderColor: a.neutralStrokeAccessible,
    personaActivityRing: a.neutralBackground1,
    personaActivityGlow: a.brandBackground,
  };
}
