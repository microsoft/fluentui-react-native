import type { ThemeColorDefinition, AppearanceOptions } from '@fluentui-react-native/theme-types';
import { PlatformColor, DynamicColorMacOS, ColorWithSystemEffectMacOS } from 'react-native-macos';

import type { AppleSemanticPalette, FluentUIApplePalette } from './appleColors.types.macos';
import { getIsHighContrast } from './appleHighContrast.macos';
import { createMacOSColorAliasTokens } from './createMacOSAliasTokens';

/** Creates a Palette of PlatformColors defined for macOS */
function getAppleSemanticPalette(): AppleSemanticPalette {
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
    underPageBackgroundColor: PlatformColor('underPageBackgroundColor'),

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
      dark: 'transparent',
    }),
    dangerShade10: DynamicColorMacOS({
      light: '#C32727',
      dark: '#transparent',
    }),
    dangerShade20: DynamicColorMacOS({
      light: '#A52121',
      dark: 'transparent',
    }),
    dangerShade30: DynamicColorMacOS({
      light: '#791818',
      dark: 'transparent',
    }),
    dangerTint10: DynamicColorMacOS({
      light: '#DD4242',
      dark: 'transparent',
    }),
    dangerTint20: DynamicColorMacOS({
      light: '#E87979',
      dark: 'transparent',
    }),
    dangerTint30: DynamicColorMacOS({
      light: '#F4B9B9',
      dark: 'transparent',
    }),
    dangerTint40: DynamicColorMacOS({
      light: '#F9D9D9',
      dark: 'transparent',
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
  };
}

/** Creates a palette of colors for the apple theme, given the FluentUI Apple Palette and Apple Semantic Palette
 * The fallback palette is loaded while we wait for  the native theming module to load, or if the module is not found
 */
export function fallbackApplePalette(mode: AppearanceOptions): ThemeColorDefinition {
  const fluentUIApple = getFluentUIApplePalette();
  const applePlatform = getAppleSemanticPalette();
  const macOSAliasColorTokens = createMacOSColorAliasTokens(mode, getIsHighContrast());

  return {
    /* PaletteBackgroundColors & PaletteTextColors */

    background: applePlatform.windowBackgroundColor,
    bodyStandoutBackground: applePlatform.underPageBackgroundColor,
    bodyFrameBackground: applePlatform.windowBackgroundColor,
    bodyFrameDivider: applePlatform.separatorColor,
    bodyText: applePlatform.labelColor,
    bodyTextChecked: applePlatform.labelColor,
    subText: applePlatform.secondaryLabelColor,
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
    buttonBackground: macOSAliasColorTokens.neutralBackground1,
    buttonBackgroundChecked: macOSAliasColorTokens.neutralBackground3,
    buttonBackgroundHovered: macOSAliasColorTokens.neutralBackground3,
    buttonBackgroundCheckedHovered: macOSAliasColorTokens.neutralBackground3,
    buttonBackgroundPressed: ColorWithSystemEffectMacOS(macOSAliasColorTokens.neutralBackground3, 'pressed'),
    buttonBackgroundDisabled: ColorWithSystemEffectMacOS(macOSAliasColorTokens.neutralBackground3, 'disabled'),
    buttonBorder: macOSAliasColorTokens.transparentStroke,
    buttonText: macOSAliasColorTokens.neutralForeground3,
    buttonTextHovered: macOSAliasColorTokens.neutralForeground3,
    buttonTextChecked: macOSAliasColorTokens.neutralForeground3,
    buttonTextCheckedHovered: macOSAliasColorTokens.neutralForeground3,
    buttonTextPressed: ColorWithSystemEffectMacOS(macOSAliasColorTokens.neutralForeground3, 'pressed'),
    buttonTextDisabled: ColorWithSystemEffectMacOS(macOSAliasColorTokens.neutralForeground3, 'disabled'),

    buttonBorderDisabled: macOSAliasColorTokens.transparentBackground,
    buttonBorderFocused: macOSAliasColorTokens.transparentBackground,

    primaryButtonBackground: fluentUIApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentUIApple.communicationBlue,
    primaryButtonBackgroundPressed: macOSAliasColorTokens.brandBackgroundPressed,
    primaryButtonBackgroundDisabled: macOSAliasColorTokens.neutralBackgroundDisabled,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: macOSAliasColorTokens.neutralForegroundInverted,
    primaryButtonTextHovered: macOSAliasColorTokens.neutralForegroundInverted,
    primaryButtonTextPressed: macOSAliasColorTokens.neutralForegroundInverted,
    primaryButtonTextDisabled: macOSAliasColorTokens.brandForeground1Disabled,

    accentButtonBackground: fluentUIApple.communicationBlue,
    accentButtonText: macOSAliasColorTokens.neutralForegroundInverted,

    menuBackground: 'transparent',
    menuDivider: applePlatform.separatorColor,
    menuIcon: macOSAliasColorTokens.neutralForeground3, //GH:728 Icon doesn't support PlatformColor
    menuHeader: applePlatform.headerTextColor,
    menuItemBackgroundHovered: applePlatform.controlAccentColor,
    menuItemBackgroundPressed: ColorWithSystemEffectMacOS(applePlatform.controlAccentColor, 'pressed'),
    menuItemText: applePlatform.labelColor,
    menuItemTextHovered: 'white',

    listBackground: 'transparent',
    listText: applePlatform.labelColor,
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
    defaultBackground: macOSAliasColorTokens.neutralBackground2,
    defaultBorder: macOSAliasColorTokens.neutralStroke2,
    defaultContent: macOSAliasColorTokens.neutralForeground2,
    defaultIcon: macOSAliasColorTokens.neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultHoveredBackground: macOSAliasColorTokens.neutralBackground3,
    defaultHoveredBorder: macOSAliasColorTokens.neutralStroke2,
    defaultHoveredContent: macOSAliasColorTokens.neutralForeground3,
    defaultHoveredIcon: macOSAliasColorTokens.neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultFocusedBackground: macOSAliasColorTokens.neutralBackground2,
    defaultFocusedBorder: macOSAliasColorTokens.neutralStroke2,
    defaultFocusedContent: macOSAliasColorTokens.neutralForeground2,
    defaultFocusedIcon: macOSAliasColorTokens.neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultPressedBackground: macOSAliasColorTokens.neutralBackground2Pressed,
    defaultPressedBorder: macOSAliasColorTokens.neutralStroke2,
    defaultPressedContent: macOSAliasColorTokens.neutralForeground2,
    defaultPressedIcon: macOSAliasColorTokens.neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultDisabledBackground: macOSAliasColorTokens.neutralBackground2,
    defaultDisabledBorder: macOSAliasColorTokens.neutralStroke2,
    defaultDisabledContent: macOSAliasColorTokens.neutralForegroundDisabled,
    defaultDisabledIcon: macOSAliasColorTokens.neutralForeground3, //GH:728 Icon doesn't support PlatformColor

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
    ghostPressedContent: macOSAliasColorTokens.brandForeground1Pressed,
    ghostPressedIcon: macOSAliasColorTokens.neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: macOSAliasColorTokens.brandForeground1Disabled,
    ghostDisabledIcon: macOSAliasColorTokens.brandForeground1Disabled,

    brandedBackground: macOSAliasColorTokens.brandBackground,
    brandedBorder: macOSAliasColorTokens.transparentStroke,
    brandedContent: macOSAliasColorTokens.neutralForegroundInverted,
    brandedIcon: macOSAliasColorTokens.neutralForegroundInverted,

    brandedHoveredBackground: macOSAliasColorTokens.brandBackgroundHover,
    brandedHoveredBorder: 'transparent',
    brandedHoveredContent: macOSAliasColorTokens.neutralForegroundInverted,
    brandedHoveredIcon: macOSAliasColorTokens.neutralForegroundInverted,

    brandedFocusedBackground: fluentUIApple.communicationBlue,
    brandedFocusedBorder: 'transparent',
    brandedFocusedContent: macOSAliasColorTokens.neutralForegroundInverted,
    brandedFocusedIcon: macOSAliasColorTokens.neutralForegroundInverted,

    brandedPressedBackground: macOSAliasColorTokens.brandBackgroundPressed, //ColorWithSystemEffectMacOS(fluentUIApple.communicationBlue, 'pressed'),
    brandedPressedBorder: 'transparent',
    brandedPressedContent: macOSAliasColorTokens.neutralForegroundInverted,
    brandedPressedIcon: macOSAliasColorTokens.neutralForegroundInverted,

    brandedDisabledBackground: macOSAliasColorTokens.neutralBackgroundDisabled,
    brandedDisabledBorder: 'transparent',
    brandedDisabledContent: macOSAliasColorTokens.brandForeground1Disabled,
    brandedDisabledIcon: macOSAliasColorTokens.neutralForeground3, //GH:728 Icon doesn't support PlatformColor

    defaultCheckedBackground: fluentUIApple.communicationBlue,
    defaultCheckedContent: macOSAliasColorTokens.neutralForegroundInverted,
    defaultCheckedHoveredBackground: fluentUIApple.communicationBlue,
    defaultCheckedHoveredContent: macOSAliasColorTokens.neutralForegroundInverted,

    brandedCheckedBackground: fluentUIApple.communicationBlue,
    brandedCheckedContent: macOSAliasColorTokens.neutralForegroundInverted,
    brandedCheckedHoveredBackground: fluentUIApple.communicationBlue,
    brandedCheckedHoveredContent: macOSAliasColorTokens.neutralForegroundInverted,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: fluentUIApple.communicationBlue,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: fluentUIApple.communicationBlue,
    ghostCheckedHoveredBorder: 'transparent',

    ghostSecondaryContent: fluentUIApple.communicationBlue,
    ghostFocusedSecondaryContent: fluentUIApple.communicationBlue,
    ghostHoveredSecondaryContent: fluentUIApple.communicationBlue,
    ghostPressedSecondaryContent: ColorWithSystemEffectMacOS(fluentUIApple.communicationBlue, 'deepPressed'),

    brandedSecondaryContent: macOSAliasColorTokens.neutralForegroundInverted,
    brandedFocusedSecondaryContent: macOSAliasColorTokens.neutralForegroundInverted,
    brandedHoveredSecondaryContent: macOSAliasColorTokens.neutralForegroundInverted,
    brandedPressedSecondaryContent: ColorWithSystemEffectMacOS(macOSAliasColorTokens.neutralForegroundInverted, 'pressed'),

    defaultDisabledSecondaryContent: macOSAliasColorTokens.brandForeground1Disabled,
    defaultHoveredSecondaryContent: macOSAliasColorTokens.neutralForeground3,
    defaultPressedSecondaryContent: macOSAliasColorTokens.neutralForegroundInverted,

    checkboxBackground: fluentUIApple.communicationBlue,
    checkboxBackgroundDisabled: macOSAliasColorTokens.neutralBackgroundDisabled,
    checkboxBorderColor: fluentUIApple.gray600,
    checkmarkColor: macOSAliasColorTokens.neutralForegroundInverted,

    personaActivityRing: macOSAliasColorTokens.neutralForegroundInverted,
    personaActivityGlow: fluentUIApple.red10,

    /* AliasColorTokens */

    neutralForeground1: macOSAliasColorTokens.neutralForeground1,
    neutralForeground1Hover: macOSAliasColorTokens.neutralForeground1Hover,
    neutralForeground1Pressed: macOSAliasColorTokens.neutralForeground1Pressed,
    neutralForeground1Selected: macOSAliasColorTokens.neutralForeground1Selected,
    neutralForeground2: macOSAliasColorTokens.neutralForeground2,
    neutralForeground2Hover: macOSAliasColorTokens.neutralForeground2Hover,
    neutralForeground2Pressed: macOSAliasColorTokens.neutralForeground2Pressed,
    neutralForeground2Selected: macOSAliasColorTokens.neutralForeground2Selected,
    neutralForeground2BrandHover: macOSAliasColorTokens.neutralForeground2BrandHover,
    neutralForeground2BrandPressed: macOSAliasColorTokens.neutralForeground2BrandPressed,
    neutralForeground2BrandSelected: macOSAliasColorTokens.neutralForeground2BrandSelected,
    neutralForeground3: macOSAliasColorTokens.neutralForeground3,
    neutralForeground3Hover: macOSAliasColorTokens.neutralForeground3Hover,
    neutralForeground3Pressed: macOSAliasColorTokens.neutralForeground3Pressed,
    neutralForeground3Selected: macOSAliasColorTokens.neutralForeground3Selected,
    neutralForeground3BrandHover: macOSAliasColorTokens.neutralForeground3BrandHover,
    neutralForeground3BrandPressed: macOSAliasColorTokens.neutralForeground3BrandPressed,
    neutralForeground3BrandSelected: macOSAliasColorTokens.neutralForeground3BrandSelected,
    neutralForeground4: macOSAliasColorTokens.neutralForeground4,
    neutralForegroundDisabled: macOSAliasColorTokens.neutralForegroundDisabled,

    brandForegroundLink: macOSAliasColorTokens.brandForegroundLink,
    brandForegroundLinkHover: macOSAliasColorTokens.brandForegroundLinkHover,
    brandForegroundLinkPressed: macOSAliasColorTokens.brandForegroundLinkPressed,
    brandForegroundLinkSelected: macOSAliasColorTokens.brandForegroundLinkSelected,
    compoundBrandForeground1: macOSAliasColorTokens.compoundBrandForeground1,
    compoundBrandForeground1Hover: macOSAliasColorTokens.compoundBrandForeground1Hover,
    compoundBrandForeground1Pressed: macOSAliasColorTokens.compoundBrandForeground1Pressed,
    brandForeground1: macOSAliasColorTokens.brandForeground1,
    brandForeground1Disabled: macOSAliasColorTokens.brandForeground1Disabled,
    brandForeground1Pressed: macOSAliasColorTokens.brandForeground1Pressed,
    brandForeground2: macOSAliasColorTokens.brandForeground2,

    neutralForegroundInverted: macOSAliasColorTokens.neutralForegroundInverted,
    neutralForegroundOnBrand: macOSAliasColorTokens.neutralForegroundOnBrand,
    neutralForegroundOnBrandHover: macOSAliasColorTokens.neutralForegroundOnBrandHover,
    neutralForegroundOnBrandPressed: macOSAliasColorTokens.neutralForegroundOnBrandPressed,
    neutralForegroundOnBrandSelected: macOSAliasColorTokens.neutralForegroundOnBrandSelected,
    neutralForegroundInvertedLink: macOSAliasColorTokens.neutralForegroundInvertedLink,
    neutralForegroundInvertedLinkHover: macOSAliasColorTokens.neutralForegroundInvertedLinkHover,
    neutralForegroundInvertedLinkPressed: macOSAliasColorTokens.neutralForegroundInvertedLinkPressed,
    neutralForegroundInvertedLinkSelected: macOSAliasColorTokens.neutralForegroundInvertedLinkSelected,

    neutralBackground1: macOSAliasColorTokens.neutralBackground1,
    neutralBackground1Hover: macOSAliasColorTokens.neutralBackground1Hover,
    neutralBackground1Pressed: macOSAliasColorTokens.neutralBackground1Pressed,
    neutralBackground1Selected: macOSAliasColorTokens.neutralBackground1Selected,
    neutralBackground2: macOSAliasColorTokens.neutralBackground2,
    neutralBackground2Hover: macOSAliasColorTokens.neutralBackground2Hover,
    neutralBackground2Pressed: macOSAliasColorTokens.neutralBackground2Pressed,
    neutralBackground2Selected: macOSAliasColorTokens.neutralBackground2Selected,
    neutralBackground3: macOSAliasColorTokens.neutralBackground3,
    neutralBackground3Hover: macOSAliasColorTokens.neutralBackground3Hover,
    neutralBackground3Pressed: macOSAliasColorTokens.neutralBackground3Pressed,
    neutralBackground3Selected: macOSAliasColorTokens.neutralBackground3Selected,
    neutralBackground4: macOSAliasColorTokens.neutralBackground4,
    neutralBackground4Hover: macOSAliasColorTokens.neutralBackground4Hover,
    neutralBackground4Pressed: macOSAliasColorTokens.neutralBackground4Pressed,
    neutralBackground4Selected: macOSAliasColorTokens.neutralBackground4Selected,
    neutralBackground5: macOSAliasColorTokens.neutralBackground5,
    neutralBackground5Hover: macOSAliasColorTokens.neutralBackground5Hover,
    neutralBackground5Pressed: macOSAliasColorTokens.neutralBackground5Pressed,
    neutralBackground5Selected: macOSAliasColorTokens.neutralBackground5Selected,
    neutralBackground6: macOSAliasColorTokens.neutralBackground6,
    neutralBackgroundInverted: macOSAliasColorTokens.neutralBackgroundInverted,

    subtleBackground: macOSAliasColorTokens.subtleBackground,
    subtleBackgroundHover: macOSAliasColorTokens.subtleBackgroundHover,
    subtleBackgroundPressed: macOSAliasColorTokens.subtleBackgroundPressed,
    subtleBackgroundSelected: macOSAliasColorTokens.subtleBackgroundSelected,

    transparentBackground: macOSAliasColorTokens.transparentBackground,
    transparentBackgroundHover: macOSAliasColorTokens.transparentBackgroundHover,
    transparentBackgroundPressed: macOSAliasColorTokens.transparentBackgroundPressed,
    transparentBackgroundSelected: macOSAliasColorTokens.transparentBackgroundSelected,
    neutralBackgroundDisabled: macOSAliasColorTokens.neutralBackgroundDisabled,

    neutralStencil1: macOSAliasColorTokens.neutralStencil1,
    neutralStencil2: macOSAliasColorTokens.neutralStencil2,

    brandBackground: macOSAliasColorTokens.brandBackground,
    brandBackgroundHover: macOSAliasColorTokens.brandBackgroundHover,
    brandBackgroundPressed: macOSAliasColorTokens.brandBackgroundPressed,
    brandBackgroundDisabled: macOSAliasColorTokens.brandBackgroundDisabled,
    brandBackgroundSelected: macOSAliasColorTokens.brandBackgroundSelected,
    compoundBrandBackground1: macOSAliasColorTokens.compoundBrandBackground1,
    compoundBrandBackground1Hover: macOSAliasColorTokens.compoundBrandBackground1Hover,
    compoundBrandBackground1Pressed: macOSAliasColorTokens.compoundBrandBackground1Pressed,

    brandBackgroundStatic: macOSAliasColorTokens.brandBackgroundStatic,
    brandBackground2: macOSAliasColorTokens.brandBackground2,

    neutralStrokeAccessible: macOSAliasColorTokens.neutralStrokeAccessible,
    neutralStrokeAccessibleHover: macOSAliasColorTokens.neutralStrokeAccessibleHover,
    neutralStrokeAccessiblePressed: macOSAliasColorTokens.neutralStrokeAccessiblePressed,
    neutralStrokeAccessibleSelected: macOSAliasColorTokens.neutralStrokeAccessibleSelected,
    neutralStroke1: macOSAliasColorTokens.neutralStroke1,
    neutralStroke1Hover: macOSAliasColorTokens.neutralStroke1Hover,
    neutralStroke1Pressed: macOSAliasColorTokens.neutralStroke1Pressed,
    neutralStroke1Selected: macOSAliasColorTokens.neutralStroke1Selected,
    neutralStroke2: macOSAliasColorTokens.neutralStroke2,
    neutralStroke3: macOSAliasColorTokens.neutralStroke3,
    brandStroke1: macOSAliasColorTokens.brandStroke1,
    brandStroke2: macOSAliasColorTokens.brandStroke2,
    compoundBrandStroke1: macOSAliasColorTokens.compoundBrandStroke1,
    compoundBrandStroke1Hover: macOSAliasColorTokens.compoundBrandStroke1Hover,
    compoundBrandStroke1Pressed: macOSAliasColorTokens.compoundBrandStroke1Pressed,
    neutralStrokeDisabled: macOSAliasColorTokens.neutralStrokeDisabled,

    transparentStroke: macOSAliasColorTokens.transparentStroke,
    transparentStrokeInteractive: macOSAliasColorTokens.transparentStrokeInteractive,
    transparentStrokeDisabled: macOSAliasColorTokens.transparentStrokeDisabled,

    strokeFocus1: macOSAliasColorTokens.strokeFocus1,
    strokeFocus2: macOSAliasColorTokens.strokeFocus2,

    redBackground1: macOSAliasColorTokens.redBackground1,
    redBackground2: macOSAliasColorTokens.redBackground2,
    redBackground3: macOSAliasColorTokens.redBackground3,
    redForeground1: macOSAliasColorTokens.redForeground1,
    redForeground2: macOSAliasColorTokens.redForeground2,
    redForeground3: macOSAliasColorTokens.redForeground3,
    redBorderActive: macOSAliasColorTokens.redBorderActive,
    redBorder1: macOSAliasColorTokens.redBorder1,
    redBorder2: macOSAliasColorTokens.redBorder2,
  };
}
