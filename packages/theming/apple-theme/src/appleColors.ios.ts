import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { ApplePalette } from './appleColors.types.ios';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

function getFluentUIAppleLightPalette(): ApplePalette {
  return {
    blue10: globalTokens.color.cornflower.primary,
    blueMagenta20: globalTokens.color.orchid.primary,
    blueMagenta30: globalTokens.color.purple.primary,
    communicationBlue: globalTokens.color.brand.primary,
    communicationBlueShade10: globalTokens.color.brand.shade10,
    communicationBlueShade20: globalTokens.color.brand.shade20,
    communicationBlueShade30: globalTokens.color.brand.shade40,
    communicationBlueTint10: '#2B88D8',
    communicationBlueTint20: globalTokens.color.brand.tint40,
    communicationBlueTint30: globalTokens.color.brand.tint50,
    communicationBlueTint40: globalTokens.color.brand.tint60,
    cyan20: globalTokens.color.teal.primary,
    cyan30: globalTokens.color.steel.primary,
    cyanBlue10: globalTokens.color.blue.primary,
    cyanBlue20: globalTokens.color.royalBlue.primary,
    dangerPrimary: '#D92C2C',
    dangerShade10: '#C32727',
    dangerShade20: '#A52121',
    dangerShade30: '#791818',
    dangerTint10: '#DD4242',
    dangerTint20: '#E87979',
    dangerTint30: '#F4B9B9',
    dangerTint40: '#F9D9D9',
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
    presenceAvailable: '#6BB700',
    presenceAway: '#FFAA44',
    presenceBlocked: globalTokens.color.cranberry.primary,
    presenceBusy: globalTokens.color.cranberry.primary,
    presenceDnd: globalTokens.color.cranberry.primary,
    presenceOffline: '#8A8886',
    presenceOof: '#B4009E',
    presenceUnknown: '#8A8886',
    red10: globalTokens.color.red.primary,
    red20: globalTokens.color.burgundy.primary,
    successPrimary: globalTokens.color.lightGreen.primary,
    successShade10: globalTokens.color.lightGreen.shade10,
    successShade20: '#0F7A0B',
    successShade30: globalTokens.color.lightGreen.shade30,
    successTint10: globalTokens.color.lightGreen.tint10,
    successTint20: '#5EC65A',
    successTint30: globalTokens.color.lightGreen.tint40,
    successTint40: globalTokens.color.lightGreen.tint50,
    warningPrimary: '#FFD335',
    warningShade10: '#E6BE30',
    warningShade20: '#C2A129',
    warningShade30: '#8F761E',
    warningTint10: '#FFD94E',
    warningTint20: '#FFE586',
    warningTint30: '#FFF2C3',
    warningTint40: '#FFF8DF',

    textDominant: '#212121', //= UIColor(light: gray900, lightHighContrast: .black, dark: .white)
    textPrimary: '#212121', //= UIColor(light: gray900, lightHighContrast: .black, dark: gray100, darkHighContrast: .white)
    textSecondary: '#6E6E6E', //= UIColor(light: gray500, lightHighContrast: gray700, dark: gray400, darkHighContrast: gray200)
    textDisabled: '#ACACAC', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    textOnAccent: globalTokens.color.white, //= UIColor(light: .white, dark: .black)

    iconPrimary: '#6E6E6E', //= UIColor(light: gray500, lightHighContrast: gray700, dark: .white)
    iconSecondary: '#919191', //= UIColor(light: gray400, lightHighContrast: gray600, dark: gray500, darkHighContrast: gray300, darkElevated: gray400)
    iconDisabled: '#ACACAC', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    iconOnAccent: globalTokens.color.white, //= UIColor(light: .white, dark: .black)

    surfacePrimary: globalTokens.color.white, //= UIColor(light: .white, dark: .black, darkElevated: gray950)
    surfaceSecondary: globalTokens.color.mink.tint60, //= UIColor(light: gray25, dark: gray950, darkElevated: gray900)
    surfaceTertiary: '#F1F1F1', //= UIColor(light: gray50, dark: gray900, darkElevated: gray800)
    surfaceQuaternary: '#E1E1E1', //= UIColor(light: gray100, dark: gray600)

    dividerOnPrimary: '#E1E1E1', //= UIColor(light: gray100, dark: gray800, darkElevated: gray700)
    dividerOnSecondary: '#C8C8C8', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
    dividerOnTertiary: '#C8C8C8', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)

    buttonBackground: 'transparent',
    buttonBackgroundFilledPressed: '#2B88D8', //UIColor(light: Colors.primaryTint10(for: window), dark: Colors.primaryTint20(for: window))
    buttonBackgroundFilledDisabled: '#E1E1E1', //surfaceQuaternary
    buttonBorderDisabled: '#E1E1E1', //surfaceQuaternary
    buttonTitleDisabled: '#ACACAC', //textDisabled
    buttonTitleWithFilledBackground: globalTokens.color.white, //textOnAccent
  };
}

function getFluentUIAppleDarkPalette(): ApplePalette {
  return {
    blue10: globalTokens.color.cornflower.primary,
    blueMagenta20: globalTokens.color.orchid.primary,
    blueMagenta30: globalTokens.color.purple.primary,
    communicationBlue: '#0086F0',
    communicationBlueShade10: '#1890F1',
    communicationBlueShade20: globalTokens.color.brand.tint20,
    communicationBlueShade30: globalTokens.color.brand.tint30,
    communicationBlueTint10: globalTokens.color.brand.primary,
    communicationBlueTint20: globalTokens.color.brand.shade30,
    communicationBlueTint30: globalTokens.color.brand.shade50,
    communicationBlueTint40: globalTokens.color.brand.shade60,
    cyan20: globalTokens.color.teal.primary,
    cyan30: globalTokens.color.steel.primary,
    cyanBlue10: globalTokens.color.blue.primary,
    cyanBlue20: globalTokens.color.royalBlue.primary,
    dangerPrimary: '#E83A3A',
    dangerShade10: '#EA4C4C',
    dangerShade20: '#EE6666',
    dangerShade30: '#F28C8C',
    dangerTint10: '#CC3333',
    dangerTint20: '#8B2323',
    dangerTint30: '#461111',
    dangerTint40: '#250909',
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
    presenceAvailable: '#92C353',
    presenceAway: '#F8D22A',
    presenceBlocked: '#D74553',
    presenceBusy: '#D74553',
    presenceDnd: '#D74553',
    presenceOffline: '#979593',
    presenceOof: '#E959D9',
    presenceUnknown: '#979593',
    red10: globalTokens.color.red.primary,
    red20: globalTokens.color.burgundy.primary,
    successPrimary: '#979593',
    successShade10: '#20BA53',
    successShade20: '#3BC569',
    successShade30: '#67D48B',
    successTint10: '#0D9D3D',
    successTint20: '#096B29',
    successTint30: '#043615',
    successTint40: '#021D0B',
    warningPrimary: '#FFC328',
    warningShade10: '#FFC83E',
    warningShade20: '#FFDD15',
    warningShade30: '#FFDD87',
    warningTint10: '#E0AB24',
    warningTint20: '#997518',
    warningTint30: '#4D3A0C',
    warningTint40: '#291F07',

    textDominant: globalTokens.color.white, //= UIColor(light: gray900, lightHighContrast: .black, dark: .white)
    textPrimary: '#E1E1E1', //= UIColor(light: gray900, lightHighContrast: .black, dark: gray100, darkHighContrast: .white)
    textSecondary: '#919191', //= UIColor(light: gray500, lightHighContrast: gray700, dark: gray400, darkHighContrast: gray200)
    textDisabled: '#404040', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    textOnAccent: globalTokens.color.black, //= UIColor(light: .white, dark: .black)

    iconPrimary: '#303030', //= UIColor(light: gray500, lightHighContrast: gray700, dark: .white)
    iconSecondary: '#404040', //= UIColor(light: gray400, lightHighContrast: gray600, dark: gray500, darkHighContrast: gray300, darkElevated: gray400)
    iconDisabled: '#6E6E6E', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    iconOnAccent: globalTokens.color.black, //= UIColor(light: .white, dark: .black)

    surfacePrimary: globalTokens.color.black, //= UIColor(light: .white, dark: .black, darkElevated: gray950)
    surfaceSecondary: globalTokens.color.grey[8], //= UIColor(light: gray25, dark: gray950, darkElevated: gray900)
    surfaceTertiary: '#212121', //= UIColor(light: gray50, dark: gray900, darkElevated: gray800)
    surfaceQuaternary: '#404040', //= UIColor(light: gray100, dark: gray600)

    dividerOnPrimary: globalTokens.color.grey[16], //= UIColor(light: gray100, dark: gray800, darkElevated: gray700)
    dividerOnSecondary: '#303030', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
    dividerOnTertiary: '#303030', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)

    buttonBackground: 'transparent',
    buttonBackgroundFilledPressed: '#004C87', //UIColor(light: Colors.primaryTint10(for: window), dark: Colors.primaryTint20(for: window))
    buttonBackgroundFilledDisabled: '#404040', //surfaceQuaternary
    buttonBorderDisabled: '#404040', //surfaceQuaternary
    buttonTitleDisabled: '#404040', //textDisabled
    buttonTitleWithFilledBackground: globalTokens.color.black, //textOnAccent
  };
}

/** Creates a palette of colors for the apple theme, using the appropriate FluentUI Apple Palette based on appearance */
export function paletteFromAppleColors(isDark: boolean): ThemeColorDefinition {
  const fluentApple = isDark ? getFluentUIAppleDarkPalette() : getFluentUIAppleLightPalette();

  return {
    /* PaletteBackgroundColors & PaletteTextColors */

    background: fluentApple.surfacePrimary,
    bodyStandoutBackground: fluentApple.surfaceSecondary,
    bodyFrameBackground: fluentApple.surfacePrimary,
    bodyFrameDivider: fluentApple.dividerOnPrimary,
    bodyText: fluentApple.textPrimary,
    bodyTextChecked: fluentApple.textPrimary,
    subText: fluentApple.textSecondary,
    bodyDivider: fluentApple.dividerOnSecondary,

    disabledBackground: fluentApple.gray100,
    disabledText: fluentApple.textDisabled,
    disabledBodyText: fluentApple.textDisabled,
    disabledSubtext: fluentApple.textDisabled,
    disabledBodySubtext: fluentApple.textDisabled,

    focusBorder: 'transparent',
    variantBorder: fluentApple.dividerOnPrimary,
    variantBorderHovered: fluentApple.dividerOnPrimary,
    defaultStateBackground: fluentApple.surfacePrimary,

    errorText: fluentApple.dangerPrimary,
    warningText: fluentApple.warningPrimary,
    errorBackground: fluentApple.dangerTint10,
    blockingBackground: fluentApple.dangerTint10,
    warningBackground: fluentApple.warningPrimary,
    warningHighlight: fluentApple.warningTint10,
    successBackground: fluentApple.successTint10,

    inputBorder: fluentApple.dividerOnPrimary,
    inputBorderHovered: fluentApple.dividerOnPrimary,
    inputBackground: fluentApple.surfacePrimary,
    inputBackgroundChecked: fluentApple.surfacePrimary,
    inputBackgroundCheckedHovered: fluentApple.surfacePrimary,
    inputForegroundChecked: fluentApple.communicationBlue,
    inputFocusBorderAlt: fluentApple.dividerOnSecondary,
    smallInputBorder: fluentApple.dividerOnSecondary,
    inputText: fluentApple.textPrimary,
    inputTextHovered: fluentApple.textPrimary,
    inputPlaceholderText: fluentApple.textSecondary,

    // Default values without any style
    // on FluentUI Apple iOS, this is the buttonStyle "Secondary Outline"
    buttonBackgroundChecked: 'transparent',
    buttonBackgroundHovered: 'transparent',
    buttonBackgroundCheckedHovered: 'transparent',
    buttonBackgroundPressed: 'transparent',
    buttonBackgroundDisabled: 'transparent',
    buttonText: fluentApple.communicationBlue,
    buttonTextHovered: fluentApple.communicationBlue,
    buttonTextChecked: fluentApple.communicationBlue,
    buttonTextCheckedHovered: fluentApple.communicationBlue,
    buttonTextPressed: fluentApple.communicationBlueTint20,
    buttonTextDisabled: fluentApple.buttonTitleDisabled,
    buttonBorderDisabled: fluentApple.buttonBorderDisabled,
    buttonBorderFocused: fluentApple.communicationBlueTint10,

    primaryButtonBackground: fluentApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentApple.communicationBlue,
    primaryButtonBackgroundPressed: fluentApple.buttonBackgroundFilledPressed,
    primaryButtonBackgroundDisabled: fluentApple.buttonBackgroundFilledDisabled,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: fluentApple.buttonTitleWithFilledBackground,
    primaryButtonTextHovered: fluentApple.buttonTitleWithFilledBackground,
    primaryButtonTextPressed: fluentApple.buttonTitleWithFilledBackground,
    primaryButtonTextDisabled: fluentApple.buttonTitleWithFilledBackground,

    accentButtonBackground: fluentApple.communicationBlue,
    accentButtonText: fluentApple.buttonTitleWithFilledBackground,

    menuBackground: fluentApple.surfacePrimary,
    menuDivider: fluentApple.dividerOnPrimary,
    menuIcon: fluentApple.iconPrimary,
    menuHeader: fluentApple.textDominant,
    menuItemBackgroundHovered: fluentApple.surfacePrimary,
    menuItemBackgroundPressed: fluentApple.surfacePrimary,
    menuItemText: fluentApple.textPrimary,
    menuItemTextHovered: fluentApple.textPrimary,

    listBackground: fluentApple.surfacePrimary,
    listText: fluentApple.textPrimary,
    listItemBackgroundHovered: fluentApple.surfacePrimary,
    listItemBackgroundChecked: fluentApple.surfacePrimary,
    listItemBackgroundCheckedHovered: fluentApple.surfacePrimary,

    listHeaderBackgroundHovered: fluentApple.textDominant,
    listHeaderBackgroundPressed: fluentApple.textDominant,

    actionLink: fluentApple.communicationBlue,
    actionLinkHovered: fluentApple.communicationBlue,
    link: fluentApple.communicationBlue,
    linkHovered: fluentApple.communicationBlue,
    linkPressed: fluentApple.communicationBlueTint10,

    /* ControlColorTokens */

    // Default values without any style
    // on FluentUI Apple iOS, this is the buttonStyle "Secondary Outline"
    buttonBackground: 'transparent',
    buttonBorder: fluentApple.communicationBlueTint10,
    buttonContent: fluentApple.communicationBlue,
    buttonIcon: fluentApple.communicationBlue,

    buttonHoveredBackground: 'transparent',
    buttonHoveredBorder: fluentApple.communicationBlueTint10,
    buttonHoveredContent: fluentApple.communicationBlue,
    buttonHoveredIcon: fluentApple.communicationBlue,

    buttonFocusedBackground: 'transparent',
    buttonFocusedBorder: fluentApple.communicationBlueTint10,
    buttonFocusedContent: fluentApple.communicationBlue,
    buttonFocusedIcon: fluentApple.communicationBlue,

    buttonPressedBackground: 'transparent',
    buttonPressedBorder: fluentApple.communicationBlueTint30,
    buttonPressedContent: fluentApple.communicationBlueTint20,
    buttonPressedIcon: fluentApple.communicationBlueTint20,

    buttonDisabledBackground: 'transparent',
    buttonDisabledBorder: fluentApple.buttonBorderDisabled,
    buttonDisabledContent: fluentApple.buttonTitleDisabled,
    buttonDisabledIcon: fluentApple.buttonTitleDisabled,

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: fluentApple.communicationBlue,
    ghostIcon: fluentApple.communicationBlue,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: fluentApple.communicationBlue,
    ghostHoveredIcon: fluentApple.communicationBlue,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: fluentApple.communicationBlue,
    ghostFocusedIcon: fluentApple.communicationBlue,

    ghostPressedBackground: 'transparent',
    ghostPressedBorder: 'transparent',
    ghostPressedContent: fluentApple.communicationBlueTint20,
    ghostPressedIcon: fluentApple.communicationBlueTint20,

    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: fluentApple.buttonTitleDisabled,
    ghostDisabledIcon: fluentApple.buttonTitleDisabled,

    brandBackground: fluentApple.communicationBlue,
    brandBorder: 'transparent',
    brandContent: fluentApple.buttonTitleWithFilledBackground,
    brandIcon: fluentApple.buttonTitleWithFilledBackground,

    brandHoveredBackground: fluentApple.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: fluentApple.buttonTitleWithFilledBackground,
    brandHoveredIcon: fluentApple.buttonTitleWithFilledBackground,

    brandFocusedBackground: fluentApple.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: fluentApple.buttonTitleWithFilledBackground,
    brandFocusedIcon: fluentApple.buttonTitleWithFilledBackground,

    brandPressedBackground: fluentApple.buttonBackgroundFilledPressed,
    brandPressedBorder: 'transparent',
    brandPressedContent: fluentApple.buttonTitleWithFilledBackground,
    brandPressedIcon: fluentApple.buttonTitleWithFilledBackground,

    brandDisabledBackground: fluentApple.buttonBackgroundFilledDisabled,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: fluentApple.buttonTitleWithFilledBackground,
    brandDisabledIcon: fluentApple.buttonTitleWithFilledBackground,

    buttonCheckedBackground: 'transparent',
    buttonCheckedContent: fluentApple.communicationBlue,
    buttonCheckedHoveredBackground: 'transparent',
    buttonCheckedHoveredContent: fluentApple.communicationBlue,

    brandCheckedBackground: fluentApple.communicationBlue,
    brandCheckedContent: fluentApple.buttonTitleWithFilledBackground,
    brandCheckedHoveredBackground: fluentApple.buttonTitleWithFilledBackground,
    brandCheckedHoveredContent: fluentApple.buttonTitleWithFilledBackground,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: fluentApple.communicationBlue,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: fluentApple.communicationBlue,
    ghostCheckedHoveredBorder: 'transparent',

    // Buttons on iOS don't have secondary text, so map these to be the same as the normal content
    ghostSecondaryContent: fluentApple.communicationBlue,
    ghostFocusedSecondaryContent: fluentApple.communicationBlue,
    ghostHoveredSecondaryContent: fluentApple.communicationBlue,
    ghostPressedSecondaryContent: fluentApple.communicationBlueTint20,

    brandSecondaryContent: fluentApple.buttonTitleWithFilledBackground,
    brandFocusedSecondaryContent: fluentApple.buttonTitleWithFilledBackground,
    brandHoveredSecondaryContent: fluentApple.buttonTitleWithFilledBackground,
    brandPressedSecondaryContent: fluentApple.buttonTitleWithFilledBackground,

    buttonDisabledSecondaryContent: fluentApple.buttonTitleDisabled,
    buttonHoveredSecondaryContent: fluentApple.communicationBlue,
    buttonPressedSecondaryContent: fluentApple.communicationBlueTint20,
  };
}
