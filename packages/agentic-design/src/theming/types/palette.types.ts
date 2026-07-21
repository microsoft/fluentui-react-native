import type { ColorValue } from 'react-native';

export interface OfficePalette {
  /**
   * Background Colors
   *
   * Background color for any region of the user interface.
   * Used by: win32-theme (createAliasesFromPalette)
   */
  Bkg: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgPressed: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgSelected: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgSelectionHighlight: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgSubtle: ColorValue;

  /**
   * Transparent Control Colors
   *
   * These colors should be used to build controls with a transparent
   * background. For example, list items and ribbon buttons.
   */
  // text
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  Text: ColorValue;
  TextRest: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextPressed: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextSelected: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextDisabled: ColorValue;
  TextSelectionHighlight: ColorValue;

  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextSecondary: ColorValue;
  TextSecondaryRest: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextSecondaryHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextSecondaryPressed: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextSecondarySelected: ColorValue;

  // emphasized text, usually with an accent color
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextEmphasis: ColorValue;
  TextEmphasisRest: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextEmphasisHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextEmphasisPressed: ColorValue;
  TextEmphasisSelected: ColorValue;

  // stroke colors (typically borders, outlines or underlines)
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  StrokeSelectedHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  StrokeKeyboard: ColorValue;

  // stroke overlay colors (typically borders, outlines or underlines)
  StrokeOverRest: ColorValue;
  StrokeOverHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
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
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgCtlDisabled: ColorValue;

  // text
  TextCtl: ColorValue;
  TextCtlHover: ColorValue;
  TextCtlPressed: ColorValue;
  TextCtlSelected: ColorValue;
  TextCtlDisabled: ColorValue;

  // stroke colors (typically borders, outlines or underlines)
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  StrokeCtl: ColorValue;
  StrokeCtlHover: ColorValue;
  StrokeCtlPressed: ColorValue;
  StrokeCtlSelected: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  StrokeCtlDisabled: ColorValue;
  StrokeCtlKeyboard: ColorValue;

  /**
   * Emphasized Push Button Controls
   *
   * Push button controls only. These controls have a non-transparent
   * background. Most other controls should not use these colors.
   */
  // background
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgCtlEmphasis: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgCtlEmphasisHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgCtlEmphasisPressed: ColorValue;
  BkgCtlEmphasisDisabled: ColorValue;

  // text
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextCtlEmphasis: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextCtlEmphasisHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
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
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  StrokeOnlyHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  StrokeOnlyPressed: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
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
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
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
   * Used by: win32-theme (createAliasesFromPalette)
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
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgToggleSwitchOff: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgToggleSwitchOffHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgToggleSwitchOffPressed: ColorValue;
  BkgToggleSwitchOffDisabled: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgToggleSwitchOn: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgToggleSwitchOnHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  BkgToggleSwitchOnPressed: ColorValue;
  BkgToggleSwitchOnDisabled: ColorValue;

  /**
   * Stroke values for toggle switches
   */
  StrokeToggleSwitchOff: ColorValue;
  StrokeToggleSwitchOffHover: ColorValue;
  StrokeToggleSwitchOffPressed: ColorValue;
  StrokeToggleSwitchOffDisabled: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  StrokeToggleSwitchOn: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  StrokeToggleSwitchOnHover: ColorValue;
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
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
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
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
  /**
   * Used by: win32-theme (createAliasesFromPalette)
   */
  TextTextBoxPlaceholder: ColorValue;
}
