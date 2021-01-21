import { ColorValue } from '@fluentui-react-native/theme-types';
import { PlatformColor } from 'react-native';

export interface AppleSemanticPalette {
  /* Adaptable System Colors */

  /** Returns a color object for blue that automatically adapts to vibrancy and accessibility settings */
  systemBlueColor: ColorValue;

  /** Returns a color object for brown that automatically adapts to vibrancy and accessibility settings */
  systemBrownColor: ColorValue;

  /** Returns a color object for gray that automatically adapts to vibrancy and accessibility settings */
  systemGrayColor: ColorValue;

  /** Returns a color object for green that automatically adapts to vibrancy and accessibility settings */
  systemGreenColor: ColorValue;

  /** Returns a color object for orange that automatically adapts to vibrancy and accessibility settings */
  systemOrangeColor: ColorValue;

  /** Returns a color object for pink that automatically adapts to vibrancy and accessibility settings */
  systemPinkColor: ColorValue;

  /** Returns a color object for purple that automatically adapts to vibrancy and accessibility settings */
  systemPurpleColor: ColorValue;

  /** Returns a color object for red that automatically adapts to vibrancy and accessibility settings */
  systemRedColor: ColorValue;

  /** Returns a color object for yellow that automatically adapts to vibrancy and accessibility settings */
  systemYellowColor: ColorValue;

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

  /** The colors to use for alternating content, typically found in table views and collection views */
  alternatingContentBackgroundColor: ColorValue;

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
  // scrubberTexturedBackground: ColorValue;

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
  // highlightColor: ColorValue;

  /** The color to use for virtual shadows cast by raised objects on the screen */
  // shadowColor: ColorValue;
}

export function getAppleSemanticPaletteWithPlatformColor(): AppleSemanticPalette {
  return {
    labelColor: PlatformColor('label', '#272727'),
    secondaryLabelColor: PlatformColor('secondaryLabel', '#808080'),
    tertiaryLabelColor: PlatformColor('tertiaryLabel', '#C0C0C0'),
    quaternaryLabelColor: PlatformColor('quaternaryLabel', '#E7E7E7'),

    systemRedColor: PlatformColor('systemRedC', '#FF3C31'),
    systemGreenColor: PlatformColor('systemGreen', '#29CD41'),
    systemBlueColor: PlatformColor('systemBlue', '#007AFF'),
    systemOrangeColor: PlatformColor('systemOrange', '#FF9602'),
    systemYellowColor: PlatformColor('systemYellow', '#FFCC01'),
    systemBrownColor: PlatformColor('systemBrown', '#A2835E'),
    systemPinkColor: PlatformColor('systemPink', '#FF2E55'),
    systemPurpleColor: PlatformColor('systemPurple', '#AF51DE'),
    systemGrayColor: PlatformColor(' systemGray', '#8D8F91'),

    linkColor: PlatformColor('link', '#0069DA'),
    placeholderTextColor: PlatformColor('placeholder', '#BFBFBF'),
    windowFrameTextColor: PlatformColor('windowFrameText', '#272727'),
    selectedMenuItemTextColor: PlatformColor('selectedMenuItemText', '#FFFFFF'),
    alternateSelectedControlTextColor: PlatformColor('alternateSelectedControlText', '#FFFFFF'),
    headerTextColor: PlatformColor('headerText', '#282828'),
    separatorColor: PlatformColor('separator', '#E6E6E6'),
    gridColor: PlatformColor('grid', '#CCCCCC'),
    textColor: PlatformColor('text', '#000000'),
    textBackgroundColor: PlatformColor('textBackground', '#FFFFFF'),
    selectedTextColor: PlatformColor('selectedText', '#000000'),
    selectedTextBackgroundColor: PlatformColor('selectedTextBackground', '#B3D7FF'),
    unemphasizedSelectedTextBackgroundColor: PlatformColor('unemphasizedSelectedTextBackground', '#DCDCDC'),
    unemphasizedSelectedTextColor: PlatformColor('unemphasizedSelectedText', '#000000'),
    windowBackgroundColor: PlatformColor('windowBackground', '#ECECEC'),
    underPageBackgroundColor: PlatformColor(' underPageBackground', '#A0A0A0'),
    controlBackgroundColor: PlatformColor('controlBackground', '#FFFFFF'),
    selectedContentBackgroundColor: PlatformColor('selectedContentBackground', '#0163E1'),
    unemphasizedSelectedContentBackgroundColor: PlatformColor('unemphasizedSelectedContentBackground', '#DCDCDC'),
    alternatingContentBackgroundColor: PlatformColor('alternatingOddContentBackground', '#F5F5F5'),
    findHighlightColor: PlatformColor('findHighlight', '#FEFF00'),
    controlColor: PlatformColor('control', '#FFFFFF'),
    controlTextColor: PlatformColor('controlText', '#272727'),
    selectedControlColor: PlatformColor('selectedControl', '##B3D7FF'),
    selectedControlTextColor: PlatformColor('selectedControlText', '##282828'),
    disabledControlTextColor: PlatformColor('disabledControlText', '#C0C0C0'),
    keyboardFocusIndicatorColor: PlatformColor('keyboardFocusIndicator', '#C5DAFE'),
    controlAccentColor: PlatformColor('controlAccent', '#007AFF'),
  };
}

export function getAppleSemanticLightPalette(): AppleSemanticPalette {
  return {
    labelColor: '#272727',
    secondaryLabelColor: '#808080',
    tertiaryLabelColor: '#C0C0C0',
    quaternaryLabelColor: '#E7E7E7',

    systemRedColor: '#FF3C31',
    systemGreenColor: '#29CD41',
    systemBlueColor: '#007AFF',
    systemOrangeColor: '#FF9602',
    systemYellowColor: '#FFCC01',
    systemBrownColor: '#A2835E',
    systemPinkColor: '#FF2E55',
    systemPurpleColor: '#AF51DE',
    systemGrayColor: '#8D8F91',

    linkColor: '#0069DA',
    placeholderTextColor: '#BFBFBF',
    windowFrameTextColor: '#272727',
    selectedMenuItemTextColor: '#FFFFFF',
    alternateSelectedControlTextColor: '#FFFFFF',
    headerTextColor: '#282828',
    separatorColor: '#E6E6E6',
    gridColor: '#CCCCCC',
    textColor: '#000000',
    textBackgroundColor: '#FFFFFF',
    selectedTextColor: '#000000',
    selectedTextBackgroundColor: '#B3D7FF',
    unemphasizedSelectedTextBackgroundColor: '#DCDCDC',
    unemphasizedSelectedTextColor: '#000000',
    windowBackgroundColor: '#ECECEC',
    underPageBackgroundColor: '#A0A0A0',
    controlBackgroundColor: '#FFFFFF',
    selectedContentBackgroundColor: '#0163E1',
    unemphasizedSelectedContentBackgroundColor: '#DCDCDC',
    alternatingContentBackgroundColor: '#F5F5F5',
    findHighlightColor: '#FEFF00',
    controlColor: '#FFFFFF',
    controlTextColor: '#272727',
    selectedControlColor: '##B3D7FF',
    selectedControlTextColor: '##282828',
    disabledControlTextColor: '#C0C0C0',
    keyboardFocusIndicatorColor: '#C5DAFE',
    controlAccentColor: '#007AFF',
  };
}

export function getAppleSemanticLightIncreasedContrastPalette(): AppleSemanticPalette {
  return {
    labelColor: '#000000',
    secondaryLabelColor: '#3E3E3E',
    tertiaryLabelColor: '#808080',
    quaternaryLabelColor: '#CCCCCC',

    systemRedColor: '#FF3C31',
    systemGreenColor: '#04AA1E',
    systemBlueColor: '#0996E0',
    systemOrangeColor: '#E67702',
    systemYellowColor: '#F6B102',
    systemBrownColor: '#A2845D',
    systemPinkColor: '#FF2A68',
    systemPurpleColor: '#8944AA',
    systemGrayColor: '#8D8F91',

    linkColor: '#0069DA',
    placeholderTextColor: '#808080',
    windowFrameTextColor: '#000000',
    selectedMenuItemTextColor: '#FFFFFF',
    alternateSelectedControlTextColor: '#FFFFFF',
    headerTextColor: '#282828',
    separatorColor: '#CCCCCC',
    gridColor: '#656565',
    textColor: '#000000',
    textBackgroundColor: '#FFFFFF',
    selectedTextColor: '#000000',
    selectedTextBackgroundColor: '#B3C6F4',
    unemphasizedSelectedTextBackgroundColor: '#DCDCDC',
    unemphasizedSelectedTextColor: '#000000',
    windowBackgroundColor: '#F6F6F6',
    underPageBackgroundColor: '#969696',
    controlBackgroundColor: '#FFFFFF',
    selectedContentBackgroundColor: '#022DC1',
    unemphasizedSelectedContentBackgroundColor: '#DCDCDC',
    alternatingContentBackgroundColor: '#EBEBEB',
    findHighlightColor: '#FEFF00',
    controlColor: '#FFFFFF',
    controlTextColor: '#262626',
    selectedControlColor: '#B3C6F4',
    selectedControlTextColor: '#272727',
    disabledControlTextColor: '#3E3E3E',
    keyboardFocusIndicatorColor: '#BECCF5',
    controlAccentColor: '#0140DD',
  };
}

export function getAppleSemanticDarkPalette(): AppleSemanticPalette {
  return {
    labelColor: '#DDDDDD',
    secondaryLabelColor: '#9C9C9C',
    tertiaryLabelColor: '#595959',
    quaternaryLabelColor: '#383838',

    systemRedColor: '#FE4538',
    systemGreenColor: '#35D64C',
    systemBlueColor: '#0A84FE',
    systemOrangeColor: '#FF9F0A',
    systemYellowColor: '#FED708',
    systemBrownColor: '#AC8E69',
    systemPinkColor: '#FF375F',
    systemPurpleColor: '#C059F2',
    systemGrayColor: '#989898',

    linkColor: '#439CFE',
    placeholderTextColor: '#595959',
    windowFrameTextColor: '#DDDDDD',
    selectedMenuItemTextColor: '#FFFFFF',
    alternateSelectedControlTextColor: '#FFFFFF',
    headerTextColor: '#FFFFFF',
    separatorColor: '#383838',
    gridColor: '#393939',
    textColor: '#FFFFFF',
    textBackgroundColor: '#1E1E1E',
    selectedTextColor: '#FFFFFF',
    selectedTextBackgroundColor: '#3E638B',
    unemphasizedSelectedTextBackgroundColor: '#464646',
    unemphasizedSelectedTextColor: '#FFFFFF',
    windowBackgroundColor: '#323332',
    underPageBackgroundColor: '#282828',
    controlBackgroundColor: '#1E1E1E',
    selectedContentBackgroundColor: '#0258D0',
    unemphasizedSelectedContentBackgroundColor: '#464646',
    alternatingContentBackgroundColor: '#2D2D2D',
    findHighlightColor: '#FEFF04',
    controlColor: '#595959',
    controlTextColor: '#DDDDDD',
    selectedControlColor: '#40638A',
    selectedControlTextColor: '#DDDDDD',
    disabledControlTextColor: '#595959',
    keyboardFocusIndicatorColor: '#274A64',
    controlAccentColor: '#007AFF',
  };
}

export function getAppleSemanticDarkIncreasedContrastPalette(): AppleSemanticPalette {
  return {
    labelColor: '#FFFFFF',
    secondaryLabelColor: '#BCBCBC',
    tertiaryLabelColor: '#8F8F8F',
    quaternaryLabelColor: '#626262',

    systemRedColor: '#FF6962',
    systemGreenColor: '#27CC42',
    systemBlueColor: '#3F9CFE',
    systemOrangeColor: '#FF9400',
    systemYellowColor: '#FFCC01',
    systemBrownColor: '#B59469',
    systemPinkColor: '#FF6582',
    systemPurpleColor: '#DA90FF',
    systemGrayColor: '#989898',

    linkColor: '#3F9DFF',
    placeholderTextColor: '#8F8F8F',
    windowFrameTextColor: '#FFFFFF',
    selectedMenuItemTextColor: '#FFFFFF',
    alternateSelectedControlTextColor: '#FFFFFF',
    headerTextColor: '#FFFFFF',
    separatorColor: '#626262',
    gridColor: '#4C4C4C',
    textColor: '#FFFFFF',
    textBackgroundColor: '#202020',
    selectedTextColor: '#FFFFFF',
    selectedTextBackgroundColor: '#4C6A8B',
    unemphasizedSelectedTextBackgroundColor: '#464646',
    unemphasizedSelectedTextColor: '#FFFFFF',
    windowBackgroundColor: '#323332',
    underPageBackgroundColor: '#282828',
    controlBackgroundColor: '#1E1E1E',
    selectedContentBackgroundColor: '#126FD0',
    unemphasizedSelectedContentBackgroundColor: '#464646',
    alternatingContentBackgroundColor: '#363636',
    findHighlightColor: '#FEFF00',
    controlColor: '#202020',
    controlTextColor: '#FFFFFF',
    selectedControlColor: '#4C698B',
    selectedControlTextColor: '#FFFFFF',
    disabledControlTextColor: '#8F8F8F',
    keyboardFocusIndicatorColor: '#305263',
    controlAccentColor: '#2C93FF',
  };
}
