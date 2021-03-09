import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { ApplePalette } from './appleColors.types.ios';

function getFluentUIAppleLightPalette(): ApplePalette {
  return {
    blue10: '#4F6BED',
    blueMagenta20: '#8764B8',
    blueMagenta30: '#5C2E91',
    communicationBlue: '#0078D4',
    communicationBlueShade10: '#106EBE',
    communicationBlueShade20: '#005A9E',
    communicationBlueShade30: '#004578',
    communicationBlueTint10: '#2B88D8',
    communicationBlueTint20: '#C7E0F4',
    communicationBlueTint30: '#DEECF9',
    communicationBlueTint40: '#EFF6FC',
    cyan20: '#038387',
    cyan30: '#005B70',
    cyanBlue10: '#0078D4',
    cyanBlue20: '#004E8C',
    dangerPrimary: '#D92C2C',
    dangerShade10: '#C32727',
    dangerShade20: '#A52121',
    dangerShade30: '#791818',
    dangerTint10: '#DD4242',
    dangerTint20: '#E87979',
    dangerTint30: '#F4B9B9',
    dangerTint40: '#F9D9D9',
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
    presenceAvailable: '#6BB700',
    presenceAway: '#FFAA44',
    presenceBlocked: '#C50F1F',
    presenceBusy: '#C50F1F',
    presenceDnd: '#C50F1F',
    presenceOffline: '#8A8886',
    presenceOof: '#B4009E',
    presenceUnknown: '#8A8886',
    red10: '#D13438',
    red20: '#A4262C',
    successPrimary: '#13A10E',
    successShade10: '#11910D',
    successShade20: '#0F7A0B',
    successShade30: '#0B5A08',
    successTint10: '#27AC22',
    successTint20: '#5EC65A',
    successTint30: '#A7E3A5',
    successTint40: '#CEF0CD',
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
    textOnAccent: 'white', //= UIColor(light: .white, dark: .black)

    iconPrimary: '#6E6E6E', //= UIColor(light: gray500, lightHighContrast: gray700, dark: .white)
    iconSecondary: '#919191', //= UIColor(light: gray400, lightHighContrast: gray600, dark: gray500, darkHighContrast: gray300, darkElevated: gray400)
    iconDisabled: '#ACACAC', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    iconOnAccent: 'white', //= UIColor(light: .white, dark: .black)

    surfacePrimary: 'white', //= UIColor(light: .white, dark: .black, darkElevated: gray950)
    surfaceSecondary: '#F8F8F8', //= UIColor(light: gray25, dark: gray950, darkElevated: gray900)
    surfaceTertiary: '#F1F1F1', //= UIColor(light: gray50, dark: gray900, darkElevated: gray800)
    surfaceQuaternary: '#E1E1E1', //= UIColor(light: gray100, dark: gray600)

    dividerOnPrimary: '#E1E1E1', //= UIColor(light: gray100, dark: gray800, darkElevated: gray700)
    dividerOnSecondary: '#C8C8C8', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
    dividerOnTertiary: '#C8C8C8', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
  };
}

function getFluentUIAppleDarkPalette(): ApplePalette {
  return {
    blue10: '#4F6BED',
    blueMagenta20: '#8764B8',
    blueMagenta30: '#5C2E91',
    communicationBlue: '#0086F0',
    communicationBlueShade10: '#1890F1',
    communicationBlueShade20: '#3AA0F3',
    communicationBlueShade30: '#6CB8F6',
    communicationBlueTint10: '#0078D4',
    communicationBlueTint20: '#004C87',
    communicationBlueTint30: '#043862',
    communicationBlueTint40: '#092C47',
    cyan20: '#038387',
    cyan30: '#005B70',
    cyanBlue10: '#0078D4',
    cyanBlue20: '#004E8C',
    dangerPrimary: '#E83A3A',
    dangerShade10: '#EA4C4C',
    dangerShade20: '#EE6666',
    dangerShade30: '#F28C8C',
    dangerTint10: '#CC3333',
    dangerTint20: '#8B2323',
    dangerTint30: '#461111',
    dangerTint40: '#250909',
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
    presenceAvailable: '#92C353',
    presenceAway: '#F8D22A',
    presenceBlocked: '#D74553',
    presenceBusy: '#D74553',
    presenceDnd: '#D74553',
    presenceOffline: '#979593',
    presenceOof: '#E959D9',
    presenceUnknown: '#979593',
    red10: '#D13438',
    red20: '#A4262C',
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

    textDominant: 'white', //= UIColor(light: gray900, lightHighContrast: .black, dark: .white)
    textPrimary: '#E1E1E1', //= UIColor(light: gray900, lightHighContrast: .black, dark: gray100, darkHighContrast: .white)
    textSecondary: '#919191', //= UIColor(light: gray500, lightHighContrast: gray700, dark: gray400, darkHighContrast: gray200)
    textDisabled: '#404040', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    textOnAccent: 'black', //= UIColor(light: .white, dark: .black)

    iconPrimary: '#303030', //= UIColor(light: gray500, lightHighContrast: gray700, dark: .white)
    iconSecondary: '#404040', //= UIColor(light: gray400, lightHighContrast: gray600, dark: gray500, darkHighContrast: gray300, darkElevated: gray400)
    iconDisabled: '#6E6E6E', //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    iconOnAccent: 'black', //= UIColor(light: .white, dark: .black)

    surfacePrimary: 'black', //= UIColor(light: .white, dark: .black, darkElevated: gray950)
    surfaceSecondary: '#141414', //= UIColor(light: gray25, dark: gray950, darkElevated: gray900)
    surfaceTertiary: '#212121', //= UIColor(light: gray50, dark: gray900, darkElevated: gray800)
    surfaceQuaternary: '#404040', //= UIColor(light: gray100, dark: gray600)

    dividerOnPrimary: '#292929', //= UIColor(light: gray100, dark: gray800, darkElevated: gray700)
    dividerOnSecondary: '#303030', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
    dividerOnTertiary: '#303030', //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
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

    buttonBackgroundChecked: fluentApple.communicationBlueTint10,
    buttonBackgroundHovered: fluentApple.communicationBlue,
    buttonBackgroundCheckedHovered: fluentApple.communicationBlueTint10,
    buttonBackgroundPressed: fluentApple.communicationBlueTint10,
    buttonBackgroundDisabled: fluentApple.gray600,
    buttonText: fluentApple.textOnAccent,
    buttonTextHovered: fluentApple.textOnAccent,
    buttonTextChecked: fluentApple.textOnAccent,
    buttonTextCheckedHovered: fluentApple.textOnAccent,
    buttonTextPressed: fluentApple.textOnAccent,
    buttonTextDisabled: fluentApple.textOnAccent,
    buttonBorderDisabled: 'transparent',
    buttonBorderFocused: 'transparent',

    primaryButtonBackground: fluentApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentApple.communicationBlue,
    primaryButtonBackgroundPressed: fluentApple.communicationBlueTint10,
    primaryButtonBackgroundDisabled: fluentApple.gray100,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: fluentApple.textOnAccent,
    primaryButtonTextHovered: fluentApple.textOnAccent,
    primaryButtonTextPressed: fluentApple.textOnAccent,
    primaryButtonTextDisabled: fluentApple.textOnAccent,

    accentButtonBackground: fluentApple.communicationBlue,
    accentButtonText: fluentApple.textOnAccent,

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
    buttonBackground: fluentApple.communicationBlue,
    buttonBorder: 'transparent',
    buttonContent: fluentApple.textOnAccent,
    buttonIcon: fluentApple.iconPrimary,

    buttonHoveredBackground: fluentApple.communicationBlue,
    buttonHoveredBorder: 'transparent',
    buttonHoveredContent: fluentApple.textOnAccent,
    buttonHoveredIcon: fluentApple.iconPrimary,

    buttonFocusedBackground: fluentApple.communicationBlue,
    buttonFocusedBorder: 'transparent',
    buttonFocusedContent: fluentApple.textOnAccent,
    buttonFocusedIcon: fluentApple.iconPrimary,

    buttonPressedBackground: fluentApple.communicationBlueTint10,
    buttonPressedBorder: 'transparent',
    buttonPressedContent: fluentApple.textOnAccent,
    buttonPressedIcon: fluentApple.iconPrimary,

    buttonDisabledBackground: fluentApple.gray600,
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: fluentApple.textDisabled,
    buttonDisabledIcon: fluentApple.textDisabled,

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: fluentApple.communicationBlue,
    ghostIcon: fluentApple.iconPrimary,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: fluentApple.communicationBlue,
    ghostHoveredIcon: fluentApple.iconPrimary,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: fluentApple.communicationBlue,
    ghostFocusedIcon: fluentApple.iconPrimary,

    ghostPressedBackground: 'transparent',
    ghostPressedBorder: 'transparent',
    ghostPressedContent: fluentApple.communicationBlueTint20,
    ghostPressedIcon: fluentApple.communicationBlueTint20,

    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: fluentApple.textDisabled,
    ghostDisabledIcon: fluentApple.textDisabled,

    brandBackground: fluentApple.communicationBlue,
    brandBorder: 'transparent',
    brandContent: fluentApple.textOnAccent,
    brandIcon: fluentApple.iconPrimary,

    brandHoveredBackground: fluentApple.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: fluentApple.textOnAccent,
    brandHoveredIcon: fluentApple.iconPrimary,

    brandFocusedBackground: fluentApple.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: fluentApple.textOnAccent,
    brandFocusedIcon: fluentApple.iconPrimary,

    brandPressedBackground: fluentApple.communicationBlueTint10,
    brandPressedBorder: 'transparent',
    brandPressedContent: fluentApple.textOnAccent,
    brandPressedIcon: fluentApple.iconPrimary,

    brandDisabledBackground: fluentApple.gray100,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: fluentApple.textOnAccent,
    brandDisabledIcon: fluentApple.iconDisabled,

    buttonCheckedBackground: fluentApple.communicationBlueTint10,
    buttonCheckedContent: fluentApple.textPrimary,
    buttonCheckedHoveredBackground: fluentApple.communicationBlueTint10,
    buttonCheckedHoveredContent: fluentApple.textPrimary,

    brandCheckedBackground: fluentApple.communicationBlueTint10,
    brandCheckedContent: fluentApple.textOnAccent,
    brandCheckedHoveredBackground: fluentApple.communicationBlueTint10,
    brandCheckedHoveredContent: fluentApple.textOnAccent,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: fluentApple.communicationBlueTint20,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: fluentApple.communicationBlueTint20,
    ghostCheckedHoveredBorder: 'transparent',

    ghostSecondaryContent: fluentApple.communicationBlue,
    ghostFocusedSecondaryContent: fluentApple.communicationBlue,
    ghostHoveredSecondaryContent: fluentApple.communicationBlue,
    ghostPressedSecondaryContent: fluentApple.communicationBlue,

    brandSecondaryContent: fluentApple.textPrimary,
    brandFocusedSecondaryContent: fluentApple.textPrimary,
    brandHoveredSecondaryContent: fluentApple.textPrimary,
    brandPressedSecondaryContent: fluentApple.textPrimary,

    buttonDisabledSecondaryContent: fluentApple.textOnAccent,
    buttonHoveredSecondaryContent: fluentApple.textPrimary,
    buttonPressedSecondaryContent: fluentApple.textPrimary,
  };
}
