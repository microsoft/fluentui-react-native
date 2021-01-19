import { ColorValue } from '@fluentui-react-native/theme-types';

export interface AppleSemanticPalette {
  labelColor: ColorValue;
  secondaryLabelColor: ColorValue;
  tertiaryLabelColor: ColorValue;
  quaternaryLabelColor: ColorValue;

  systemRedColor: ColorValue;
  systemGreenColor: ColorValue;
  systemBlueColor: ColorValue;
  systemOrangeColor: ColorValue;
  systemYellowColor: ColorValue;
  systemBrownColor: ColorValue;
  systemPinkColor: ColorValue;
  systemPurpleColor: ColorValue;
  systemGrayColor: ColorValue;

  linkColor: ColorValue;
  placeholderTextColor: ColorValue;
  windowFrameTextColor: ColorValue;
  selectedMenuItemTextColor: ColorValue;
  alternateSelectedControlTextColor: ColorValue;
  headerTextColor: ColorValue;
  separatorColor: ColorValue;
  gridColor: ColorValue;
  textColor: ColorValue;
  textBackgroundColor: ColorValue;
  selectedTextColor: ColorValue;
  selectedTextBackgroundColor: ColorValue;
  unemphasizedSelectedTextBackgroundColor: ColorValue;
  unemphasizedSelectedTextColor: ColorValue;
  windowBackgroundColor: ColorValue;
  underPageBackgroundColor: ColorValue;
  controlBackgroundColor: ColorValue;
  selectedContentBackgroundColor: ColorValue;
  unemphasizedSelectedContentBackgroundColor: ColorValue;
  alternatingContentBackgroundColor: ColorValue;
  findHighlightColor: ColorValue;
  controlColor: ColorValue;
  controlTextColor: ColorValue;
  selectedControlColor: ColorValue;
  selectedControlTextColor: ColorValue;
  disabledControlTextColor: ColorValue;
  keyboardFocusIndicatorColor: ColorValue;
  controlAccentColor: ColorValue;
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
