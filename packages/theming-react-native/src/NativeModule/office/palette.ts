import { IOfficePalette } from './palette.types';
import { IPalette } from '@uifabricshared/theming-ramp';

export function paletteFromOfficeColors(p: IOfficePalette): IPalette {
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
    inputFocusBorderAlt: p.StrokeCtlEmphasisKeyboard,
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

    primaryButtonBackground: p.BkgCtlEmphasis,
    primaryButtonBackgroundHovered: p.BkgCtlEmphasisHover,
    primaryButtonBackgroundPressed: p.BkgCtlEmphasisPressed,
    primaryButtonBackgroundDisabled: p.BkgCtlEmphasisDisabled,
    primaryButtonBorder: p.StrokeCtlEmphasis,
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
    linkPressed: p.TextHyperlinkPressed
  };
}
