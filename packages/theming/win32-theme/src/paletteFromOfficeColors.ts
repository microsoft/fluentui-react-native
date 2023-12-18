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
    disabledSubtext: p.TextCtlSubtleDisabled,
    disabledBodySubtext: p.TextDisabled,

    focusBorder: p.StrokeKeyboard,
    variantBorder: p.AccentOutline,
    variantBorderHovered: p.AccentOutline,
    defaultStateBackground: p.Bkg,

    errorText: p.TextError,
    warningText: p.Text,
    errorBackground: p.Bkg,
    blockingBackground: p.Bkg,
    warningBackground: p.Bkg,
    warningHighlight: p.TextError,
    successBackground: p.TextEmphasis,

    inputBorder: p.StrokeCtlSubtle,
    inputBorderHovered: p.StrokeCtlSubtleHover,
    inputBackground: p.BkgCtlSubtle,
    inputBackgroundChecked: p.BkgCtlSubtle,
    inputBackgroundCheckedHovered: p.BkgCtlSubtleHover,
    inputForegroundChecked: p.TextCtlSubtle,
    inputFocusBorderAlt: p.StrokeCtlSubtleKeyboard,
    smallInputBorder: p.StrokeCtlSubtle,
    inputText: p.TextCtlSubtle,
    inputTextHovered: p.TextCtlSubtleHover,
    inputPlaceholderText: p.TextCtlSubtlePlaceholder,

    buttonBackground: p.BkgCtl,
    buttonBackgroundChecked: p.BkgCtlSelected,
    buttonBackgroundHovered: p.BkgCtlHover,
    buttonBackgroundCheckedHovered: p.BkgCtlSelected,
    buttonBackgroundPressed: p.BkgCtlPressed,
    buttonBackgroundDisabled: p.BkgCtlDisabled,
    buttonBorder: p.StrokeCtl,
    buttonText: p.TextCtl,
    buttonTextHovered: p.TextCtlHover,
    buttonTextChecked: p.TextCtlSelected,
    buttonTextCheckedHovered: p.TextCtlSelected,
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
    accentButtonText: p.TextCtlEmphasis,

    menuBackground: p.Bkg,
    menuDivider: p.AccentLight,
    menuIcon: p.Text,
    menuHeader: p.Text,
    menuItemBackgroundHovered: p.BkgHover,
    menuItemBackgroundPressed: p.BkgPressed,
    menuItemText: p.Text,
    menuItemTextHovered: p.TextHover,

    listBackground: p.Bkg,
    listText: p.Text,
    listItemBackgroundHovered: p.BkgHover,
    listItemBackgroundChecked: p.BkgSelected,
    listItemBackgroundCheckedHovered: p.BkgSelected,

    listHeaderBackgroundHovered: p.BkgHover,
    listHeaderBackgroundPressed: p.BkgPressed,

    actionLink: p.TextActive,
    actionLinkHovered: p.TextActiveHover,
    link: p.TextHyperlink,
    linkHovered: p.TextHyperlinkHover,
    linkPressed: p.TextHyperlinkPressed,

    defaultBackground: p.BkgCtl,
    defaultBorder: p.StrokeCtl,
    defaultContent: p.TextCtl,
    defaultIcon: p.TextCtl,

    defaultHoveredIcon: p.TextCtlHover,

    defaultFocusedIcon: p.TextCtlHover,

    defaultPressedIcon: p.TextCtlPressed,

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
    brandedContent: p.TextCtlEmphasis,
    brandedIcon: p.TextCtlEmphasis,

    brandedHoveredBackground: p.BkgCtlEmphasisHover,
    brandedHoveredBorder: p.StrokeCtlEmphasisHover,
    brandedHoveredContent: p.TextCtlEmphasisHover,
    brandedHoveredIcon: p.TextCtlEmphasisHover,

    brandedFocusedBackground: p.BkgCtlEmphasisHover,
    brandedFocusedBorder: p.StrokeCtlEmphasisKeyboard,
    brandedFocusedContent: p.TextCtlEmphasisHover,
    brandedFocusedIcon: p.TextCtlEmphasisHover,

    brandedPressedBackground: p.BkgCtlEmphasisPressed,
    brandedPressedBorder: p.StrokeCtlEmphasisPressed,
    brandedPressedContent: p.TextCtlEmphasisPressed,
    brandedPressedIcon: p.TextCtlEmphasisPressed,

    brandedDisabledBackground: p.BkgCtlEmphasisDisabled,
    brandedDisabledBorder: p.StrokeCtlEmphasisDisabled,
    brandedDisabledContent: p.TextCtlEmphasisDisabled,
    brandedDisabledIcon: p.TextCtlEmphasisDisabled,

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
