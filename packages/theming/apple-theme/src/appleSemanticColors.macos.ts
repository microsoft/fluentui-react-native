import { ColorValue } from '@fluentui-react-native/theme-types';
import { PlatformColor } from 'react-native';

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

export function getAppleSemanticPalette(): AppleSemanticPalette {
  return {
    labelColor: PlatformColor('labelColor'),
    secondaryLabelColor: PlatformColor('secondaryLabelColor'),
    tertiaryLabelColor: PlatformColor('tertiaryLabelColor'),
    quaternaryLabelColor: PlatformColor('quaternaryLabelColor'),

    textColor: PlatformColor('textColor'),
    placeholderTextColor: PlatformColor('placeholderTextColor'),
    textBackgroundColor: PlatformColor('textBackgroundColor'),

    selectedTextColor: PlatformColor('selectedTexColor'),
    selectedTextBackgroundColor: PlatformColor('selectedTextBackgroundColor'),
    keyboardFocusIndicatorColor: PlatformColor('keyboardFocusIndicatorColor'),
    unemphasizedSelectedTextColor: PlatformColor('unemphasizedSelectedTextColor'),
    unemphasizedSelectedTextBackgroundColor: PlatformColor('unemphasizedSelectedTextBackgroundColor'),

    linkColor: PlatformColor('linkColor'),
    separatorColor: PlatformColor('separatorColor'),
    selectedContentBackgroundColor: PlatformColor('selectedContentBackgroundColor'),
    unemphasizedSelectedContentBackgroundColor: PlatformColor('unemphasizedSelectedContentBackgroundColor'),

    selectedMenuItemTextColor: PlatformColor('selectedMenuItemTextColor'),

    gridColor: PlatformColor('gridColor'),
    headerTextColor: PlatformColor('headerTextColor'),
    alternatingOddContentBackgroundColor: PlatformColor('alternatingOddContentBackgroundColor'),
    alternatingEvenContentBackgroundColor: PlatformColor('alternatingOddContentBackgroundColor'),

    controlAccentColor: PlatformColor('controlAccentColor'),
    controlColor: PlatformColor('controlColor'),
    controlBackgroundColor: PlatformColor('controlBackgroundColor'),
    controlTextColor: PlatformColor('controlTextColor'),
    disabledControlTextColor: PlatformColor('disabledControlTextColor'),
    selectedControlColor: PlatformColor('selectedControlColor'),
    selectedControlTextColor: PlatformColor('selectedControlTextColor'),
    alternateSelectedControlTextColor: PlatformColor('alternateSelectedControlTextColor'),
    scrubberTexturedBackground: PlatformColor('scrubberTexturedBackground'),

    windowBackgroundColor: PlatformColor('windowBackgroundColor'),
    windowFrameTextColor: PlatformColor('windowFrameTextColor'),
    underPageBackgroundColor: PlatformColor(' underPageBackgroundColor'),

    findHighlightColor: PlatformColor('findHighlightColor'),
    highlightColor: PlatformColor('highlightColor'),
    shadowColor: PlatformColor('shadowColor'),
  };
}
