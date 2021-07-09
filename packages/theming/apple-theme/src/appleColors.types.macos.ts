import { ColorValue } from 'react-native';

/** Palette of Apple Platform Colors, defined at https://developer.apple.com/documentation/appkit/nscolor/ui_element_colors */
export interface AppleSemanticPalette {
  /* Label Colors */

  /** The primary color to use for text labels */
  labelColor: ColorValue;

  /** The secondary color to use for text labels */
  secondaryLabelColor: ColorValue;

  /** The tertiary color to use for text labels */
  tertiaryLabelColor: ColorValue;

  /** The quaternary color to use for text labels and separators */
  quaternaryLabelColor: ColorValue;

  /* Text Colors */

  /** The color to use for text */
  textColor: ColorValue;

  /** The color to use for placeholder text in controls or text views */
  placeholderTextColor: ColorValue;

  /** The color to use for selected text */
  selectedTextColor: ColorValue;

  /** The color to use for the background area behind text */
  textBackgroundColor: ColorValue;

  /** The color to use for the background of selected text */
  selectedTextBackgroundColor: ColorValue;

  /** The color to use for the keyboard focus ring around controls */
  keyboardFocusIndicatorColor: ColorValue;

  /** The color to use for selected text in an unemphasized context */
  unemphasizedSelectedTextColor: ColorValue;

  /** The color to use for the text background in an unemphasized context */
  unemphasizedSelectedTextBackgroundColor: ColorValue;

  /* Content Colors */

  /** The color to use for links */
  linkColor: ColorValue;

  /** The color to use for separators between different sections of content */
  separatorColor: ColorValue;

  /** The color to use for the background of selected and emphasized content */
  selectedContentBackgroundColor: ColorValue;

  /** The color to use for selected and unemphasized content */
  unemphasizedSelectedContentBackgroundColor: ColorValue;

  /* Menu Colors */

  /** The color to use for the text in menu items */
  selectedMenuItemTextColor: ColorValue;

  /* Table Colors */

  /** The color to use for the optional gridlines, such as those in a table view */
  gridColor: ColorValue;

  /** The color to use for text in header cells in table views and outline views */
  headerTextColor: ColorValue;

  /** The colors to use for alternating (odd Rows) content, typically found in table views and collection views */
  alternatingOddContentBackgroundColor: ColorValue;

  /** The colors to use for alternating (even Rows)content, typically found in table views and collection views */
  alternatingEvenContentBackgroundColor: ColorValue;

  /* Control Colors */

  /** The user's current accent color preference */
  controlAccentColor: ColorValue;

  /** The color to use for the flat surfaces of a control */
  controlColor: ColorValue;

  /** The color to use for the background of large controls, such as scroll views or table views */
  controlBackgroundColor: ColorValue;

  /** The color to use for text on enabled controls */
  controlTextColor: ColorValue;

  /** The color to use for text on disabled controls */
  disabledControlTextColor: ColorValue;

  /** The color to use for the face of a selected control—that is, a control that has been clicked or is being dragged */
  selectedControlColor: ColorValue;

  /** The color to use for text in a selected control—that is, a control being clicked or dragged */
  selectedControlTextColor: ColorValue;

  /** The color to use for text in a selected control */
  alternateSelectedControlTextColor: ColorValue;

  /** The patterned color to use for the background of a scrubber control */
  scrubberTexturedBackground: ColorValue;

  /* Windows Colors */

  /** The color to use for the window background */
  windowBackgroundColor: ColorValue;

  /** The color to use for text in a window's frame */
  windowFrameTextColor: ColorValue;

  /** The color to use in the area beneath your window's views */
  underPageBackgroundColor: ColorValue;

  /* Highlights and Shadows */

  /** The highlight color to use for the bubble that shows inline search result values */
  findHighlightColor: ColorValue;

  /** The color to use as a virtual light source on the screen */
  highlightColor: ColorValue;

  /** The color to use for virtual shadows cast by raised objects on the screen */
  shadowColor: ColorValue;
}

/** Palette of colors defined in FluentUI Apple */
interface FluentUIAppleBasePalette {
  blue10: ColorValue;
  blueMagenta20: ColorValue;
  blueMagenta30: ColorValue;
  communicationBlue: ColorValue;
  communicationBlueShade10: ColorValue;
  communicationBlueShade20: ColorValue;
  communicationBlueShade30: ColorValue;
  communicationBlueTint10: ColorValue;
  communicationBlueTint20: ColorValue;
  communicationBlueTint30: ColorValue;
  communicationBlueTint40: ColorValue;
  cyan20: ColorValue;
  cyan30: ColorValue;
  cyanBlue10: ColorValue;
  cyanBlue20: ColorValue;
  dangerPrimary: ColorValue;
  dangerShade10: ColorValue;
  dangerShade20: ColorValue;
  dangerShade30: ColorValue;
  dangerTint10: ColorValue;
  dangerTint20: ColorValue;
  dangerTint30: ColorValue;
  dangerTint40: ColorValue;
  gray20: ColorValue;
  gray25: ColorValue;
  gray30: ColorValue;
  gray40: ColorValue;
  gray50: ColorValue;
  gray100: ColorValue;
  gray200: ColorValue;
  gray300: ColorValue;
  gray400: ColorValue;
  gray500: ColorValue;
  gray600: ColorValue;
  gray700: ColorValue;
  gray800: ColorValue;
  gray900: ColorValue;
  gray950: ColorValue;
  green10: ColorValue;
  green20: ColorValue;
  magenta10: ColorValue;
  magenta20: ColorValue;
  magentaPink10: ColorValue;
  orange20: ColorValue;
  orange30: ColorValue;
  orangeYellow20: ColorValue;
  pinkRed10: ColorValue;
  presenceAvailable: ColorValue;
  presenceAway: ColorValue;
  presenceBlocked: ColorValue;
  presenceBusy: ColorValue;
  presenceDnd: ColorValue;
  presenceOffline: ColorValue;
  presenceOof: ColorValue;
  presenceUnknown: ColorValue;
  red10: ColorValue;
  red20: ColorValue;
  successPrimary: ColorValue;
  successShade10: ColorValue;
  successShade20: ColorValue;
  successShade30: ColorValue;
  successTint10: ColorValue;
  successTint20: ColorValue;
  successTint30: ColorValue;
  successTint40: ColorValue;
  warningPrimary: ColorValue;
  warningShade10: ColorValue;
  warningShade20: ColorValue;
  warningShade30: ColorValue;
  warningTint10: ColorValue;
  warningTint20: ColorValue;
  warningTint30: ColorValue;
  warningTint40: ColorValue;
}

/** A set of control tokens used on the FluentUI Apple macOS button */
interface FluentAppleButtonTokens {
  brandForegroundDisabled: ColorValue;
  brandBackgroundDisabled: ColorValue;
  neutralInverted: ColorValue;
  neutralForeground2: ColorValue;
  neutralBackground2: ColorValue;
  neutralStroke2: ColorValue;
  neutralForeground3: ColorValue;
  neutralBackground3: ColorValue;
}

export type FluentUIApplePalette = FluentUIAppleBasePalette & FluentAppleButtonTokens;
