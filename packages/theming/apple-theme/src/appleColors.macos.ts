import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { AppleSemanticPalette, FluentUIApplePalette } from './appleColors.types.macos';
import { PlatformColor, DynamicColorMacOS, ColorWithSystemEffectMacOS } from 'react-native-macos';
import { Appearance } from 'react-native';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

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
    blue10: globalTokens.color.cornflower.primary,
    blueMagenta20: globalTokens.color.orchid.primary,
    blueMagenta30: globalTokens.color.purple.primary,
    communicationBlue: DynamicColorMacOS({
      light: globalTokens.color.brand.primary,
      dark: '#1890F1',
    }),
    communicationBlueShade10: DynamicColorMacOS({
      light: globalTokens.color.brand.shade10,
      dark: '#1890F1',
    }),
    communicationBlueShade20: DynamicColorMacOS({
      light: globalTokens.color.brand.shade20,
      dark: globalTokens.color.brand.tint20,
    }),
    communicationBlueShade30: DynamicColorMacOS({
      light: globalTokens.color.brand.shade40,
      dark: globalTokens.color.brand.tint30,
    }),
    communicationBlueTint10: DynamicColorMacOS({
      light: '#2B88D8',
      dark: globalTokens.color.brand.primary,
    }),
    communicationBlueTint20: DynamicColorMacOS({
      light: globalTokens.color.brand.tint40,
      dark: globalTokens.color.brand.shade30,
    }),
    communicationBlueTint30: DynamicColorMacOS({
      light: globalTokens.color.brand.tint50,
      dark: globalTokens.color.brand.shade50,
    }),
    communicationBlueTint40: DynamicColorMacOS({
      light: globalTokens.color.brand.tint60,
      dark: globalTokens.color.brand.shade60,
    }),

    cyan20: globalTokens.color.teal.primary,
    cyan30: globalTokens.color.steel.primary,
    cyanBlue10: globalTokens.color.blue.primary,
    cyanBlue20: globalTokens.color.royalBlue.primary,
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
    gray20: globalTokens.color.platinum.primary,
    gray25: globalTokens.color.mink.tint60,
    gray30: globalTokens.color.beige.primary,
    gray40: globalTokens.color.charcoal.primary,
    gray50: '#F1F1F1',
    gray100: '#E1E1E1',
    gray200: '#C8C8C8',
    gray300: '#ACACAC',
    gray400: '#919191',
    gray500: '#6E6E6E',
    gray600: '#404040',
    gray700: '#303030',
    gray800: globalTokens.color.grey[16],
    gray900: '#212121',
    gray950: globalTokens.color.grey[8],
    green10: globalTokens.color.forest.primary,
    green20: globalTokens.color.darkGreen.primary,
    magenta10: globalTokens.color.berry.primary,
    magenta20: globalTokens.color.grape.primary,
    magentaPink10: globalTokens.color.hotPink.primary,
    orange20: globalTokens.color.pumpkin.primary,
    orange30: globalTokens.color.brown.primary,
    orangeYellow20: globalTokens.color.brass.primary,
    pinkRed10: globalTokens.color.darkRed.primary,
    presenceAvailable: DynamicColorMacOS({
      light: '#6BB700',
      dark: '#92C353',
    }),
    presenceAway: DynamicColorMacOS({
      light: '#FFAA44',
      dark: '#F8D22A',
    }),
    presenceBlocked: DynamicColorMacOS({
      light: globalTokens.color.cranberry.primary,
      dark: '#D74553',
    }),
    presenceBusy: DynamicColorMacOS({
      light: globalTokens.color.cranberry.primary,
      dark: '#D74553',
    }),
    presenceDnd: DynamicColorMacOS({
      light: globalTokens.color.cranberry.primary,
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
    red10: globalTokens.color.red.primary,
    red20: globalTokens.color.burgundy.primary,
    successPrimary: DynamicColorMacOS({
      light: globalTokens.color.lightGreen.primary,
      dark: '#979593',
    }),
    successShade10: DynamicColorMacOS({
      light: globalTokens.color.lightGreen.shade10,
      dark: '#20BA53',
    }),
    successShade20: DynamicColorMacOS({
      light: globalTokens.color.lightGreen.shade20,
      dark: '#3BC569',
    }),
    successShade30: DynamicColorMacOS({
      light: globalTokens.color.lightGreen.shade30,
      dark: '#67D48B',
    }),
    successTint10: DynamicColorMacOS({
      light: globalTokens.color.lightGreen.tint10,
      dark: '#0D9D3D',
    }),
    successTint20: DynamicColorMacOS({
      light: globalTokens.color.lightGreen.tint30,
      dark: '#096B29',
    }),
    successTint30: DynamicColorMacOS({
      light: globalTokens.color.lightGreen.tint40,
      dark: '#043615',
    }),
    successTint40: DynamicColorMacOS({
      light: globalTokens.color.lightGreen.tint50,
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
      dark: globalTokens.color.white + '3F',
    }),
    brandBackgroundDisabled: DynamicColorMacOS({
      light: '#2525253F',
      dark: '#5656567F',
    }),
    neutralInverted: globalTokens.color.white,
    neutralForeground2: globalTokens.color.black + 'D8',
    neutralBackground2: DynamicColorMacOS({
      light: globalTokens.color.white,
      dark: '#555555',
    }),
    neutralStroke2: globalTokens.color.black + '26',
    neutralForeground3: DynamicColorMacOS({
      light: '#272727',
      dark: globalTokens.color.white,
    }),
    neutralBackground3: DynamicColorMacOS({
      light: globalTokens.color.black + '0C',
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
  const neutralForeground3 = getCurrentAppearance(appearance, 'light') === 'light' ? '#272727' : globalTokens.color.white;

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
    buttonBackgroundChecked: fluentUIApple.neutralBackground3,
    buttonBackgroundHovered: fluentUIApple.neutralBackground3,
    buttonBackgroundCheckedHovered: fluentUIApple.neutralBackground3,
    buttonBackgroundPressed: ColorWithSystemEffectMacOS(fluentUIApple.neutralBackground3, 'pressed'),
    buttonBackgroundDisabled: ColorWithSystemEffectMacOS(fluentUIApple.neutralBackground3, 'disabled'),
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
    menuIcon: applePlatform.textColor,
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
    buttonBackground: fluentUIApple.neutralBackground3,
    buttonBorder: 'transparent',
    buttonContent: fluentUIApple.neutralForeground3,
    buttonIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    buttonHoveredBackground: fluentUIApple.neutralBackground3,
    buttonHoveredBorder: 'transparent',
    buttonHoveredContent: fluentUIApple.neutralForeground3,
    buttonHoveredIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    buttonFocusedBackground: fluentUIApple.neutralBackground3,
    buttonFocusedBorder: 'transparent',
    buttonFocusedContent: fluentUIApple.neutralForeground3,
    buttonFocusedIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    buttonPressedBackground: ColorWithSystemEffectMacOS(fluentUIApple.neutralBackground3, 'pressed'),
    buttonPressedBorder: 'transparent',
    buttonPressedContent: ColorWithSystemEffectMacOS(fluentUIApple.neutralForeground3, 'pressed'),
    buttonPressedIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    buttonDisabledBackground: ColorWithSystemEffectMacOS(fluentUIApple.neutralBackground3, 'disabled'),
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: ColorWithSystemEffectMacOS(fluentUIApple.neutralForeground3, 'pressed'),
    buttonDisabledIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

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

    brandBackground: fluentUIApple.communicationBlue,
    brandBorder: 'transparent',
    brandContent: fluentUIApple.neutralInverted,
    brandIcon: fluentUIApple.neutralInverted,

    brandHoveredBackground: fluentUIApple.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: fluentUIApple.neutralInverted,
    brandHoveredIcon: fluentUIApple.neutralInverted,

    brandFocusedBackground: fluentUIApple.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: fluentUIApple.neutralInverted,
    brandFocusedIcon: fluentUIApple.neutralInverted,

    brandPressedBackground: ColorWithSystemEffectMacOS(fluentUIApple.communicationBlue, 'pressed'),
    brandPressedBorder: 'transparent',
    brandPressedContent: fluentUIApple.neutralInverted,
    brandPressedIcon: fluentUIApple.neutralInverted,

    brandDisabledBackground: fluentUIApple.brandBackgroundDisabled,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: fluentUIApple.brandForegroundDisabled,
    brandDisabledIcon: neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    buttonCheckedBackground: fluentUIApple.communicationBlue,
    buttonCheckedContent: fluentUIApple.neutralInverted,
    buttonCheckedHoveredBackground: fluentUIApple.communicationBlue,
    buttonCheckedHoveredContent: fluentUIApple.neutralInverted,

    brandCheckedBackground: fluentUIApple.communicationBlue,
    brandCheckedContent: fluentUIApple.neutralInverted,
    brandCheckedHoveredBackground: fluentUIApple.communicationBlue,
    brandCheckedHoveredContent: fluentUIApple.neutralInverted,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: fluentUIApple.communicationBlue,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: fluentUIApple.communicationBlue,
    ghostCheckedHoveredBorder: 'transparent',

    ghostSecondaryContent: fluentUIApple.communicationBlue,
    ghostFocusedSecondaryContent: fluentUIApple.communicationBlue,
    ghostHoveredSecondaryContent: fluentUIApple.communicationBlue,
    ghostPressedSecondaryContent: ColorWithSystemEffectMacOS(fluentUIApple.communicationBlue, 'deepPressed'),

    brandSecondaryContent: fluentUIApple.neutralInverted,
    brandFocusedSecondaryContent: fluentUIApple.neutralInverted,
    brandHoveredSecondaryContent: fluentUIApple.neutralInverted,
    brandPressedSecondaryContent: ColorWithSystemEffectMacOS(fluentUIApple.neutralInverted, 'pressed'),

    buttonDisabledSecondaryContent: fluentUIApple.brandForegroundDisabled,
    buttonHoveredSecondaryContent: fluentUIApple.neutralInverted,
    buttonPressedSecondaryContent: fluentUIApple.neutralInverted,
  };
}
