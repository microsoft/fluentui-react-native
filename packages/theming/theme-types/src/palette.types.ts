import { ColorValue } from './Color.types';

export interface OfficePalette {
  /**
   * Background Colors
   *
   * Background color for any region of the user interface.
   */
  Bkg: ColorValue;
  BkgHover: ColorValue;
  BkgPressed: ColorValue;
  BkgSelected: ColorValue;
  BkgSelectionHighlight: ColorValue;

  /**
   * Transparent Control Colors
   *
   * These colors should be used to build controls with a transparent
   * background. For example, list items and ribbon buttons.
   */
  // text
  Text: ColorValue;
  TextRest: ColorValue;
  TextHover: ColorValue;
  TextPressed: ColorValue;
  TextSelected: ColorValue;
  TextDisabled: ColorValue;
  TextSelectionHighlight: ColorValue;

  TextSecondary: ColorValue;
  TextSecondaryRest: ColorValue;
  TextSecondaryHover: ColorValue;
  TextSecondaryPressed: ColorValue;
  TextSecondarySelected: ColorValue;

  // emphasized text, usually with an accent color
  TextEmphasis: ColorValue;
  TextEmphasisRest: ColorValue;
  TextEmphasisHover: ColorValue;
  TextEmphasisPressed: ColorValue;
  TextEmphasisSelected: ColorValue;

  // stroke colors (typically borders, outlines or underlines)
  StrokeSelectedHover: ColorValue;
  StrokeKeyboard: ColorValue;

  // stroke overlay colors (typically borders, outlines or underlines)
  StrokeOverlayRest: ColorValue;
  StrokeOverlayHover: ColorValue;
  StrokeOverlayPressed: ColorValue;
  StrokeOverlaySelectedRest: ColorValue;
  StrokeOverlaySelectedHover: ColorValue;
  StrokeOverlaySelectedPressed: ColorValue;

  /**
   * Push Button Controls
   *
   * Push button controls only. These controls have a non-transparent
   * background. Most other controls should not use these colors.
   */
  // background
  BkgCtl: ColorValue;
  BkgCtlHover: ColorValue;
  BkgCtlPressed: ColorValue;
  BkgCtlSelected: ColorValue;
  BkgCtlDisabled: ColorValue;

  // text
  TextCtl: ColorValue;
  TextCtlHover: ColorValue;
  TextCtlPressed: ColorValue;
  TextCtlSelected: ColorValue;
  TextCtlDisabled: ColorValue;

  // stroke colors (typically borders, outlines or underlines)
  StrokeCtl: ColorValue;
  StrokeCtlHover: ColorValue;
  StrokeCtlPressed: ColorValue;
  StrokeCtlSelected: ColorValue;
  StrokeCtlDisabled: ColorValue;
  StrokeCtlKeyboard: ColorValue;

  /**
   * Emphasized Push Button Controls
   *
   * Push button controls only. These controls have a non-transparent
   * background. Most other controls should not use these colors.
   */
  // background
  BkgCtlEmphasis: ColorValue;
  BkgCtlEmphasisHover: ColorValue;
  BkgCtlEmphasisPressed: ColorValue;
  BkgCtlEmphasisDisabled: ColorValue;

  // text
  TextCtlEmphasis: ColorValue;
  TextCtlEmphasisHover: ColorValue;
  TextCtlEmphasisPressed: ColorValue;
  TextCtlEmphasisDisabled: ColorValue;

  // stroke colors (typically borders, outlines or underlines)
  StrokeCtlEmphasis: ColorValue;
  StrokeCtlEmphasisHover: ColorValue;
  StrokeCtlEmphasisPressed: ColorValue;
  StrokeCtlEmphasisDisabled: ColorValue;
  StrokeCtlEmphasisKeyboard: ColorValue;

  /**
   * Text Controls
   *
   * Controls which have a background, even in dark themes, such as text box,
   * combo box, check box, and radio button.
   */
  // background
  BkgCtlSubtle: ColorValue;
  BkgCtlSubtleHover: ColorValue;
  BkgCtlSubtlePressed: ColorValue;
  BkgCtlSubtleDisabled: ColorValue;
  BkgCtlSubtleSelectionHighlight: ColorValue;

  // text
  TextCtlSubtle: ColorValue;
  TextCtlSubtlePlaceholder: ColorValue;
  TextCtlSubtleHover: ColorValue;
  TextCtlSubtlePressed: ColorValue;
  TextCtlSubtleDisabled: ColorValue;
  TextCtlSubtleSelectionHighlight: ColorValue;

  // stroke colors (typically borders, outlines or underlines)
  StrokeCtlSubtle: ColorValue;
  StrokeCtlSubtleHover: ColorValue;
  StrokeCtlSubtlePressed: ColorValue;
  StrokeCtlSubtleDisabled: ColorValue;
  StrokeCtlSubtleKeyboard: ColorValue;

  /**
   * Hyperlinks
   */
  TextHyperlink: ColorValue;
  TextHyperlinkHover: ColorValue;
  TextHyperlinkPressed: ColorValue;

  /**
   * Active Text
   *
   * Text only states, with no background change, such as a pivot control.
   */
  TextActive: ColorValue;
  TextActiveHover: ColorValue;
  TextActivePressed: ColorValue;
  TextActiveSelected: ColorValue;

  /**
   * Errors
   */
  TextError: ColorValue;
  TextErrorHover: ColorValue;
  TextErrorPressed: ColorValue;
  TextErrorSelected: ColorValue;

  /**
   * Accents
   */
  AccentDark: ColorValue;
  AccentLight: ColorValue;
  AccentEmphasis: ColorValue;
  AccentOutline: ColorValue;

  /**
   * Headers
   *
   * Used for headings on sections of the user interface.
   */
  BkgHeader: ColorValue;
  TextHeader: ColorValue;
}
