import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { AppleSemanticPalette, FluentUIApplePalette } from './appleColors.types.macos';
import { PlatformColor, DynamicColorMacOS, ColorWithSystemEffectMacOS } from 'react-native-macos';
import { Appearance } from 'react-native';

/** Creates a Palette of PlatformColors defined for macOS */
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

function getFluentUIApplePalette(): FluentUIApplePalette {
  return {
    blue10: '#4F6BED',
    blueMagenta20: '#8764B8',
    blueMagenta30: '#5C2E91',
    communicationBlue: DynamicColorMacOS({
      light: '#0078D4',
      dark: '#1890F1',
    }),
    communicationBlueShade10: DynamicColorMacOS({
      light: '#106EBE',
      dark: '#1890F1',
    }),
    communicationBlueShade20: DynamicColorMacOS({
      light: '#005A9E',
      dark: '#3AA0F3',
    }),
    communicationBlueShade30: DynamicColorMacOS({
      light: '#004578',
      dark: '#6CB8F6',
    }),
    communicationBlueTint10: DynamicColorMacOS({
      light: '#2B88D8',
      dark: '#0078D4',
    }),
    communicationBlueTint20: DynamicColorMacOS({
      light: '#C7E0F4',
      dark: '#004C87',
    }),
    communicationBlueTint30: DynamicColorMacOS({
      light: '#DEECF9',
      dark: '#043862',
    }),
    communicationBlueTint40: DynamicColorMacOS({
      light: '#EFF6FC',
      dark: '#092C47',
    }),

    cyan20: '#038387',
    cyan30: '#005B70',
    cyanBlue10: '#0078D4',
    cyanBlue20: '#004E8C',
    dangerPrimary: DynamicColorMacOS({
      light: '#D92C2C',
      dark: '#clear',
    }),
    dangerShade10: DynamicColorMacOS({
      light: '#C32727',
      dark: '#clear',
    }),
    dangerShade20: DynamicColorMacOS({
      light: '#A52121',
      dark: '#clear',
    }),
    dangerShade30: DynamicColorMacOS({
      light: '#791818',
      dark: '#clear',
    }),
    dangerTint10: DynamicColorMacOS({
      light: '#DD4242',
      dark: '#clear',
    }),
    dangerTint20: DynamicColorMacOS({
      light: '#E87979',
      dark: '#clear',
    }),
    dangerTint30: DynamicColorMacOS({
      light: '#F4B9B9',
      dark: '#clear',
    }),
    dangerTint40: DynamicColorMacOS({
      light: '#F9D9D9',
      dark: '#clear',
    }),
    gray20: '#69797E',
    gray25: '#F8F8F8',
    gray30: '#7A7574',
    gray40: '#393939',
    gray50: '#F1F1F1',
    gray100: '#E1E1E1',
    gray200: '#C8C8C8',
    gray300: '#ACACAC',
    gray400: '#919191',
    gray500: '#6E6E6E',
    gray600: '#404040',
    gray700: '#303030',
    gray800: '#292929',
    gray900: '#212121',
    gray950: '#141414',
    green10: '#498205',
    green20: '#0B6A0B',
    magenta10: '#C239B3',
    magenta20: '#881798',
    magentaPink10: '#E3008C',
    orange20: '#CA5010',
    orange30: '#8E562E',
    orangeYellow20: '#986F0B',
    pinkRed10: '#750B1C',
    presenceAvailable: DynamicColorMacOS({
      light: '#6BB700',
      dark: '#92C353',
    }),
    presenceAway: DynamicColorMacOS({
      light: '#FFAA44',
      dark: '#F8D22A',
    }),
    presenceBlocked: DynamicColorMacOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceBusy: DynamicColorMacOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceDnd: DynamicColorMacOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceOffline: DynamicColorMacOS({
      light: '#8A8886',
      dark: '#979593',
    }),
    presenceOof: DynamicColorMacOS({
      light: '#B4009E',
      dark: '#E959D9',
    }),
    presenceUnknown: DynamicColorMacOS({
      light: '#8A8886',
      dark: '#979593',
    }),
    red10: '#D13438',
    red20: '#A4262C',
    successPrimary: DynamicColorMacOS({
      light: '#13A10E',
      dark: '#979593',
    }),
    successShade10: DynamicColorMacOS({
      light: '#11910D',
      dark: '#20BA53',
    }),
    successShade20: DynamicColorMacOS({
      light: '#0F7A0B',
      dark: '#3BC569',
    }),
    successShade30: DynamicColorMacOS({
      light: '#0B5A08',
      dark: '#67D48B',
    }),
    successTint10: DynamicColorMacOS({
      light: '#27AC22',
      dark: '#0D9D3D',
    }),
    successTint20: DynamicColorMacOS({
      light: '#5EC65A',
      dark: '#096B29',
    }),
    successTint30: DynamicColorMacOS({
      light: '#A7E3A5',
      dark: '#043615',
    }),
    successTint40: DynamicColorMacOS({
      light: '#CEF0CD',
      dark: '#021D0B',
    }),
    warningPrimary: DynamicColorMacOS({
      light: '#FFD335',
      dark: '#FFC328',
    }),
    warningShade10: DynamicColorMacOS({
      light: '#E6BE30',
      dark: '#FFC83E',
    }),
    warningShade20: DynamicColorMacOS({
      light: '#C2A129',
      dark: '#FFDD15',
    }),
    warningShade30: DynamicColorMacOS({
      light: '#8F761E',
      dark: '#FFDD87',
    }),
    warningTint10: DynamicColorMacOS({
      light: '#FFD94E',
      dark: '#E0AB24',
    }),
    warningTint20: DynamicColorMacOS({
      light: '#FFE586',
      dark: '#997518',
    }),
    warningTint30: DynamicColorMacOS({
      light: '#FFF2C3',
      dark: '#4D3A0C',
    }),
    warningTint40: DynamicColorMacOS({
      light: '#FFF8DF',
      dark: '#291F07',
    }),

    brandForegroundDisabled: DynamicColorMacOS({
      light: '#2525253F',
      dark: '#FFFFFF3F',
    }),
    brandBackgroundDisabled: DynamicColorMacOS({
      light: '#2525253F',
      dark: '#5656567F',
    }),
    neutralInverted: '#FFFFFF',
    neutralForeground2: '#000000D8',
    neutralBackground2: DynamicColorMacOS({
      light: '#FFFFFF',
      dark: '#555555',
    }),
    neutralStroke2: '#00000026',
    neutralForeground3: DynamicColorMacOS({
      light: '#272727',
      dark: '#FFFFFF',
    }),
    neutralBackground3: DynamicColorMacOS({
      light: '#0000000C',
      dark: '#555555',
    }),
  };
}

/** Creates a palette of colors for the apple theme, given the FluentUI Apple Palette and Apple Semantic Palette
 * The fallback palette is loaded while we wait for the native theming module to load, or if the module is not found
 */
export function fallbackApplePalette(): ThemeColorDefinition {
  const fluentUIApple = getFluentUIApplePalette();
  const applePlatform = getAppleSemanticPalette();

  // GH:728 Until RN-SVG Supports PlatformColor, we need this workaround
  const appearance = Appearance.getColorScheme();
  const neutralForeground3 = getCurrentAppearance(appearance, 'light') === 'light' ? '#272727' : '#FFFFFF';

  return {
    /* PaletteBackgroundColors & PaletteTextColors */

    background: applePlatform.windowBackgroundColor,
    bodyStandoutBackground: applePlatform.underPageBackgroundColor,
    bodyFrameBackground: applePlatform.windowBackgroundColor,
    bodyFrameDivider: applePlatform.separatorColor,
    bodyText: applePlatform.textColor,
    bodyTextChecked: applePlatform.selectedTextColor,
    subText: applePlatform.placeholderTextColor,
    bodyDivider: applePlatform.separatorColor,

    disabledBackground: fluentUIApple.gray100,
    disabledText: applePlatform.tertiaryLabelColor,
    disabledBodyText: applePlatform.tertiaryLabelColor,
    disabledSubtext: applePlatform.quaternaryLabelColor,
    disabledBodySubtext: applePlatform.quaternaryLabelColor,

    focusBorder: 'transparent',
    variantBorder: applePlatform.separatorColor,
    variantBorderHovered: applePlatform.separatorColor,
    defaultStateBackground: applePlatform.controlBackgroundColor,

    errorText: fluentUIApple.dangerPrimary,
    warningText: fluentUIApple.warningPrimary,
    errorBackground: fluentUIApple.dangerTint10,
    blockingBackground: fluentUIApple.dangerTint10,
    warningBackground: fluentUIApple.warningPrimary,
    warningHighlight: fluentUIApple.warningTint10,
    successBackground: fluentUIApple.successTint10,

    inputBorder: applePlatform.separatorColor,
    inputBorderHovered: applePlatform.separatorColor,
    inputBackground: applePlatform.textBackgroundColor,
    inputBackgroundChecked: applePlatform.textBackgroundColor,
    inputBackgroundCheckedHovered: applePlatform.textBackgroundColor,
    inputForegroundChecked: fluentUIApple.communicationBlue,
    inputFocusBorderAlt: applePlatform.keyboardFocusIndicatorColor,
    smallInputBorder: applePlatform.separatorColor,
    inputText: applePlatform.textColor,
    inputTextHovered: applePlatform.textColor,
    inputPlaceholderText: applePlatform.placeholderTextColor,

    // Set the default button tokens to match the Acrylic Button style
    buttonBackground: fluentUIApple.neutralBackground3,
    buttonBackgroundChecked: fluentUIApple.neutralBackground3,
    buttonBackgroundHovered: fluentUIApple.neutralBackground3,
    buttonBackgroundCheckedHovered: fluentUIApple.neutralBackground3,
    buttonBackgroundPressed: ColorWithSystemEffectMacOS(fluentUIApple.neutralBackground3, 'pressed'),
    buttonBackgroundDisabled: ColorWithSystemEffectMacOS(fluentUIApple.neutralBackground3, 'disabled'),
    buttonBorder: 'transparent',
    buttonText: fluentUIApple.neutralForeground3,
    buttonTextHovered: fluentUIApple.neutralForeground3,
    buttonTextChecked: fluentUIApple.neutralForeground3,
    buttonTextCheckedHovered: fluentUIApple.neutralForeground3,
    buttonTextPressed: ColorWithSystemEffectMacOS(fluentUIApple.neutralForeground3, 'pressed'),
    buttonTextDisabled: ColorWithSystemEffectMacOS(fluentUIApple.neutralForeground3, 'disabled'),

    buttonBorderDisabled: 'transparent',
    buttonBorderFocused: 'transparent',

    primaryButtonBackground: fluentUIApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentUIApple.communicationBlue,
    primaryButtonBackgroundPressed: ColorWithSystemEffectMacOS(fluentUIApple.communicationBlue, 'pressed'),
    primaryButtonBackgroundDisabled: fluentUIApple.brandBackgroundDisabled,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: fluentUIApple.neutralInverted,
    primaryButtonTextHovered: fluentUIApple.neutralInverted,
    primaryButtonTextPressed: ColorWithSystemEffectMacOS(fluentUIApple.neutralInverted, 'pressed'),
    primaryButtonTextDisabled: fluentUIApple.brandForegroundDisabled,

    accentButtonBackground: fluentUIApple.communicationBlue,
    accentButtonText: fluentUIApple.neutralInverted,

    menuBackground: 'transparent',
    menuDivider: applePlatform.separatorColor,
    menuIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor
    menuHeader: applePlatform.headerTextColor,
    menuItemBackgroundHovered: 'transparent',
    menuItemBackgroundPressed: applePlatform.selectedContentBackgroundColor,
    menuItemText: applePlatform.textColor,
    menuItemTextHovered: applePlatform.textColor,

    listBackground: 'transparent',
    listText: applePlatform.textColor,
    listItemBackgroundHovered: 'transparent',
    listItemBackgroundChecked: 'transparent',
    listItemBackgroundCheckedHovered: 'transparent',

    listHeaderBackgroundHovered: applePlatform.headerTextColor,
    listHeaderBackgroundPressed: applePlatform.headerTextColor,

    actionLink: applePlatform.linkColor,
    actionLinkHovered: applePlatform.linkColor,
    link: applePlatform.linkColor,
    linkHovered: applePlatform.linkColor,
    linkPressed: applePlatform.selectedControlColor,

    /* ControlColorTokens */

    // Set the default button tokens to match the Acrylic Button style
    defaultBackground: fluentUIApple.neutralBackground3,
    defaultBorder: 'transparent',
    defaultContent: fluentUIApple.neutralForeground3,
    defaultIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultHoveredBackground: fluentUIApple.neutralBackground3,
    defaultHoveredBorder: 'transparent',
    defaultHoveredContent: fluentUIApple.neutralForeground3,
    defaultHoveredIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultFocusedBackground: fluentUIApple.neutralBackground3,
    defaultFocusedBorder: 'transparent',
    defaultFocusedContent: fluentUIApple.neutralForeground3,
    defaultFocusedIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultPressedBackground: ColorWithSystemEffectMacOS(fluentUIApple.neutralBackground3, 'pressed'),
    defaultPressedBorder: 'transparent',
    defaultPressedContent: ColorWithSystemEffectMacOS(fluentUIApple.neutralForeground3, 'pressed'),
    defaultPressedIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultDisabledBackground: ColorWithSystemEffectMacOS(fluentUIApple.neutralBackground3, 'disabled'),
    defaultDisabledBorder: 'transparent',
    defaultDisabledContent: ColorWithSystemEffectMacOS(fluentUIApple.neutralForeground3, 'pressed'),
    defaultDisabledIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: fluentUIApple.communicationBlue,
    ghostIcon: fluentUIApple.communicationBlue,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: fluentUIApple.communicationBlue,
    ghostHoveredIcon: fluentUIApple.communicationBlue,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: fluentUIApple.communicationBlue,
    ghostFocusedIcon: fluentUIApple.communicationBlue,

    ghostPressedBackground: 'transparent',
    ghostPressedBorder: 'transparent',
    ghostPressedContent: ColorWithSystemEffectMacOS(fluentUIApple.communicationBlue, 'deepPressed'),
    ghostPressedIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: fluentUIApple.brandForegroundDisabled,
    ghostDisabledIcon: fluentUIApple.brandForegroundDisabled,

    brandedBackground: fluentUIApple.communicationBlue,
    brandedBorder: 'transparent',
    brandedContent: fluentUIApple.neutralInverted,
    brandedIcon: fluentUIApple.neutralInverted,

    brandedHoveredBackground: fluentUIApple.communicationBlue,
    brandedHoveredBorder: 'transparent',
    brandedHoveredContent: fluentUIApple.neutralInverted,
    brandedHoveredIcon: fluentUIApple.neutralInverted,

    brandedFocusedBackground: fluentUIApple.communicationBlue,
    brandedFocusedBorder: 'transparent',
    brandedFocusedContent: fluentUIApple.neutralInverted,
    brandedFocusedIcon: fluentUIApple.neutralInverted,

    brandedPressedBackground: ColorWithSystemEffectMacOS(fluentUIApple.communicationBlue, 'pressed'),
    brandedPressedBorder: 'transparent',
    brandedPressedContent: fluentUIApple.neutralInverted,
    brandedPressedIcon: fluentUIApple.neutralInverted,

    brandedDisabledBackground: fluentUIApple.brandBackgroundDisabled,
    brandedDisabledBorder: 'transparent',
    brandedDisabledContent: fluentUIApple.brandForegroundDisabled,
    brandedDisabledIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultCheckedBackground: fluentUIApple.communicationBlue,
    defaultCheckedContent: fluentUIApple.neutralInverted,
    defaultCheckedHoveredBackground: fluentUIApple.communicationBlue,
    defaultCheckedHoveredContent: fluentUIApple.neutralInverted,

    brandedCheckedBackground: fluentUIApple.communicationBlue,
    brandedCheckedContent: fluentUIApple.neutralInverted,
    brandedCheckedHoveredBackground: fluentUIApple.communicationBlue,
    brandedCheckedHoveredContent: fluentUIApple.neutralInverted,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: fluentUIApple.communicationBlue,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: fluentUIApple.communicationBlue,
    ghostCheckedHoveredBorder: 'transparent',

    ghostSecondaryContent: fluentUIApple.communicationBlue,
    ghostFocusedSecondaryContent: fluentUIApple.communicationBlue,
    ghostHoveredSecondaryContent: fluentUIApple.communicationBlue,
    ghostPressedSecondaryContent: ColorWithSystemEffectMacOS(fluentUIApple.communicationBlue, 'deepPressed'),

    brandedSecondaryContent: fluentUIApple.neutralInverted,
    brandedFocusedSecondaryContent: fluentUIApple.neutralInverted,
    brandedHoveredSecondaryContent: fluentUIApple.neutralInverted,
    brandedPressedSecondaryContent: ColorWithSystemEffectMacOS(fluentUIApple.neutralInverted, 'pressed'),

    defaultDisabledSecondaryContent: fluentUIApple.brandForegroundDisabled,
    defaultHoveredSecondaryContent: fluentUIApple.neutralInverted,
    defaultPressedSecondaryContent: fluentUIApple.neutralInverted,

    checkboxBackground: fluentUIApple.communicationBlue,
    checkboxBackgroundDisabled: fluentUIApple.brandBackgroundDisabled,
    checkboxBorderColor: fluentUIApple.gray600,
    checkmarkColor: fluentUIApple.neutralInverted,

    personaActivityRing: fluentUIApple.neutralInverted,
    personaActivityGlow: fluentUIApple.red10,
  };
}
