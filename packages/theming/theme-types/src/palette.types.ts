import type { ColorValue } from 'react-native';

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
  BkgSubtle: ColorValue;

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
  StrokeOverRest: ColorValue;
  StrokeOverHover: ColorValue;
  StrokeOverPressed: ColorValue;
  StrokeOverSelectedRest: ColorValue;
  StrokeOverSelectedHover: ColorValue;
  StrokeOverSelectedPressed: ColorValue;

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

  // text
  TextCtlSubtle: ColorValue;
  TextCtlSubtleHover: ColorValue;
  TextCtlSubtlePressed: ColorValue;
  TextCtlSubtleDisabled: ColorValue;

  // stroke colors (typically borders, outlines or underlines)
  StrokeCtlSubtle: ColorValue;
  StrokeCtlSubtleHover: ColorValue;
  StrokeCtlSubtlePressed: ColorValue;
  StrokeCtlSubtleDisabled: ColorValue;
  StrokeCtlSubtleKeyboard: ColorValue;

  // standalone stroke colors
  StrokeOnlyHover: ColorValue;
  StrokeOnlyPressed: ColorValue;
  StrokeOnlySelected: ColorValue;

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
   *
   * Used to emphasize or create boundaries around/within UI.
   */

  // Used for general borders
  AccentDark: ColorValue;

  // Used for separator lines
  AccentLight: ColorValue;

  // Used for accent rectangles and bolder borders
  AccentEmphasis: ColorValue;

  // Used for borders that outline the entire UI region
  AccentOutline: ColorValue;

  // A subtle tint used to accent a region on top of Bkg
  BkgAccentTint: ColorValue;

  // A foreground color used for contrasting text on top of BkgAccentTint
  TextAccentTint: ColorValue;

  /**
   * Headers
   *
   * Used for headings on sections of the user interface.
   */
  BkgHeader: ColorValue;
  TextHeader: ColorValue;

  /**
   * Thumb toggle colors
   */
  ThumbToggleSwitchOff: ColorValue;
  ThumbToggleSwitchOffHover: ColorValue;
  ThumbToggleSwitchOffPressed: ColorValue;
  ThumbToggleSwitchOffDisabled: ColorValue;
  ThumbToggleSwitchOn: ColorValue;
  ThumbToggleSwitchOnHover: ColorValue;
  ThumbToggleSwitchOnPressed: ColorValue;
  ThumbToggleSwitchOnDisabled: ColorValue;

  /**
   * Background values for toggle switches
   */
  BkgToggleSwitchOff: ColorValue;
  BkgToggleSwitchOffHover: ColorValue;
  BkgToggleSwitchOffPressed: ColorValue;
  BkgToggleSwitchOffDisabled: ColorValue;
  BkgToggleSwitchOn: ColorValue;
  BkgToggleSwitchOnHover: ColorValue;
  BkgToggleSwitchOnPressed: ColorValue;
  BkgToggleSwitchOnDisabled: ColorValue;

  /**
   * Stroke values for toggle switches
   */
  StrokeToggleSwitchOff: ColorValue;
  StrokeToggleSwitchOffHover: ColorValue;
  StrokeToggleSwitchOffPressed: ColorValue;
  StrokeToggleSwitchOffDisabled: ColorValue;
  StrokeToggleSwitchOn: ColorValue;
  StrokeToggleSwitchOnHover: ColorValue;
  StrokeToggleSwitchOnPressed: ColorValue;
  StrokeToggleSwitchOnDisabled: ColorValue;

  /**
   * Slider colors
   */
  SliderPrimary: ColorValue;
  SliderPrimaryHover: ColorValue;
  SliderPrimaryPressed: ColorValue;
  SliderPrimaryDisabled: ColorValue;
  SliderSecondary: ColorValue;
  SliderBuffer: ColorValue;
  SliderKeyboard: ColorValue;
  SliderToolTipBorder: ColorValue;
  SliderToolTipLabel: ColorValue;
  SliderToolTipBkg: ColorValue;

  /**
   * Assorted other colors
   */
  TextEmphasis2: ColorValue;
  BkgCtlSubtleSelected: ColorValue;
  TextCtlSubtleSelected: ColorValue;
  BkgCtlEmphasisFocus: ColorValue;
  BkgCtlSubtleFocus: ColorValue;
  BkgCtlSubtleHoverDisabled: ColorValue;
  BkgCtlSubtleSelectedDisabled: ColorValue;
  TextTextBoxPlaceholder: ColorValue;
}
