import type { Palette, OfficePalette } from '@fluentui-react-native/theme-types';

export function paletteFromOfficeColors(p: OfficePalette): Palette {
  return {
    background: p.Bkg,
    bodyStandoutBackground: p.Bkg,
    bodyFrameBackground: p.Bkg,
    bodyFrameDivider: p.AccentLight,
    bodyText: p.Text,
    bodyTextChecked: p.TextSelected,
    subText: p.TextSecondary,
    bodyDivider: p.AccentLight,

    disabledBackground: p.BkgCtlSubtleDisabled,
    disabledText: p.TextCtlSubtleDisabled,
    disabledBodyText: p.TextDisabled,

    focusBorder: p.StrokeKeyboard,
    variantBorder: p.AccentOutline,

    errorText: p.TextError,

    inputBorder: p.StrokeCtlSubtle,
    inputBackground: p.BkgCtlSubtle,
    inputFocusBorderAlt: p.StrokeCtlSubtleKeyboard,
    inputText: p.TextCtlSubtle,
    inputPlaceholderText: p.TextTextBoxPlaceholder,

    buttonBackground: p.BkgCtl,
    buttonBackgroundChecked: p.BkgCtlSelected,
    buttonBackgroundHovered: p.BkgCtlHover,
    buttonBackgroundPressed: p.BkgCtlPressed,
    buttonBackgroundDisabled: p.BkgCtlDisabled,
    buttonBorder: p.StrokeCtl,
    buttonText: p.TextCtl,
    buttonTextHovered: p.TextCtlHover,
    buttonTextChecked: p.TextCtlSelected,
    buttonTextPressed: p.TextCtlPressed,
    buttonTextDisabled: p.TextCtlDisabled,
    buttonBorderDisabled: p.StrokeCtlDisabled,
    buttonBorderFocused: p.StrokeCtlKeyboard,

    primaryButtonBackground: p.BkgCtlEmphasis,
    primaryButtonBackgroundHovered: p.BkgCtlEmphasisHover,
    primaryButtonBackgroundPressed: p.BkgCtlEmphasisPressed,
    primaryButtonBackgroundDisabled: p.BkgCtlEmphasisDisabled,
    primaryButtonBorder: p.StrokeCtlEmphasis,
    primaryButtonBorderFocused: p.StrokeCtlEmphasisKeyboard,
    primaryButtonText: p.TextCtlEmphasis,
    primaryButtonTextHovered: p.TextCtlEmphasisHover,
    primaryButtonTextPressed: p.TextCtlEmphasisPressed,
    primaryButtonTextDisabled: p.TextCtlEmphasisDisabled,

    accentButtonBackground: p.BkgCtlEmphasis,

    menuBackground: p.Bkg,
    menuDivider: p.AccentLight,
    menuIcon: p.Text,
    menuItemBackgroundHovered: p.BkgHover,
    menuItemBackgroundPressed: p.BkgPressed,
    menuItemText: p.Text,
    menuItemTextHovered: p.TextHover,

    listHeaderBackgroundHovered: p.BkgHover,
    listHeaderBackgroundPressed: p.BkgPressed,

    actionLink: p.TextActive,
    link: p.TextHyperlink,
    linkHovered: p.TextHyperlinkHover,
    linkPressed: p.TextHyperlinkPressed,

    defaultBackground: p.BkgCtl,
    defaultBorder: p.StrokeCtl,
    defaultContent: p.TextCtl,
    defaultIcon: p.TextCtl,

    defaultHoveredBackground: p.BkgCtlHover,
    defaultHoveredBorder: p.StrokeCtlHover,
    defaultHoveredContent: p.TextCtlHover,
    defaultHoveredIcon: p.TextCtlHover,

    defaultFocusedBackground: p.BkgCtlHover,
    defaultFocusedBorder: p.StrokeCtlKeyboard,
    defaultFocusedContent: p.TextCtlHover,
    defaultFocusedIcon: p.TextCtlHover,

    defaultPressedBackground: p.BkgCtlPressed,
    defaultPressedBorder: p.StrokeCtlPressed,
    defaultPressedContent: p.TextCtlPressed,
    defaultPressedIcon: p.TextCtlPressed,

    defaultDisabledBackground: p.BkgCtlDisabled,
    defaultDisabledBorder: p.StrokeCtlDisabled,
    defaultDisabledContent: p.TextCtlDisabled,
    defaultDisabledIcon: p.TextCtlDisabled,

    ghostBackground: p.Bkg,
    ghostBorder: p.Bkg,
    ghostContent: p.Text,
    ghostIcon: p.Text,

    ghostHoveredBackground: p.BkgHover,
    ghostHoveredBorder: p.BkgHover,
    ghostHoveredContent: p.TextHover,
    ghostHoveredIcon: p.TextHover,

    ghostFocusedBackground: p.BkgHover,
    ghostFocusedBorder: p.StrokeKeyboard,
    ghostFocusedContent: p.TextHover,
    ghostFocusedIcon: p.TextHover,

    ghostPressedBackground: p.BkgPressed,
    ghostPressedBorder: p.BkgPressed,
    ghostPressedContent: p.TextPressed,
    ghostPressedIcon: p.TextPressed,

    ghostDisabledBackground: p.Bkg,
    ghostDisabledBorder: p.Bkg,
    ghostDisabledContent: p.TextDisabled,
    ghostDisabledIcon: p.TextDisabled,

    brandedBackground: p.BkgCtlEmphasis,

    brandedDisabledBorder: p.StrokeCtlEmphasisDisabled,

    defaultCheckedBackground: p.BkgCtlSelected,
    defaultCheckedContent: p.TextCtlSelected,
    defaultCheckedHoveredBackground: p.BkgCtlHover,
    defaultCheckedHoveredContent: p.TextCtlHover,

    ghostCheckedBackground: p.BkgSelected,
    ghostCheckedContent: p.TextSelected,
    ghostCheckedHoveredBackground: p.BkgHover,
    ghostCheckedHoveredContent: p.TextHover,
    ghostCheckedHoveredBorder: p.StrokeSelectedHover,

    ghostSecondaryContent: p.TextSecondary,
    ghostFocusedSecondaryContent: p.TextSecondaryHover,
    ghostHoveredSecondaryContent: p.TextSecondaryHover,
    ghostPressedSecondaryContent: p.TextSecondaryPressed,
  };
}
