import { Palette, ThemeColorDefinition } from '@fluentui-react-native/theme-types';

import { ColorValue } from '@fluentui-react-native/theme-types';

// Palette of FluentUI Apple Colors
export interface ApplePalette {
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

// Instantiates the Palette with colors from FluentUI Apple and the platform semantic colors
export function paletteFromAppleColors(p: ApplePalette): Palette {
  return {
    background: p.gray200,
    bodyStandoutBackground: p.gray40,
    bodyFrameBackground: p.blue10,
    bodyFrameDivider: p.blue10,
    bodyText: p.blue10,
    bodyTextChecked: p.blue10,
    subText: p.blue10,
    bodyDivider: p.blue10,

    disabledBackground: p.blue10,
    disabledText: p.blue10,
    disabledBodyText: p.blue10,
    disabledSubtext: p.blue10,
    disabledBodySubtext: p.blue10,

    focusBorder: p.blue10,
    variantBorder: p.blue10,
    variantBorderHovered: p.blue10,
    defaultStateBackground: p.blue10,

    errorText: p.blue10,
    warningText: p.blue10,
    errorBackground: p.blue10,
    blockingBackground: p.blue10,
    warningBackground: p.blue10,
    warningHighlight: p.blue10,
    successBackground: p.blue10,

    inputBorder: p.blue10,
    inputBorderHovered: p.blue10,
    inputBackground: p.blue10,
    inputBackgroundChecked: p.blue10,
    inputBackgroundCheckedHovered: p.blue10,
    inputForegroundChecked: p.blue10,
    inputFocusBorderAlt: p.blue10,
    smallInputBorder: p.blue10,
    inputText: p.blue10,
    inputTextHovered: p.blue10,
    inputPlaceholderText: p.blue10,

    buttonBackgroundChecked: p.blue10,
    buttonBackgroundHovered: p.blue10,
    buttonBackgroundCheckedHovered: p.blue10,
    buttonBackgroundPressed: p.blue10,
    buttonBackgroundDisabled: p.blue10,
    buttonText: p.blue10,
    buttonTextHovered: p.blue10,
    buttonTextChecked: p.blue10,
    buttonTextCheckedHovered: p.blue10,
    buttonTextPressed: p.blue10,
    buttonTextDisabled: p.blue10,
    buttonBorderDisabled: p.blue10,
    buttonBorderFocused: p.blue10,

    primaryButtonBackground: p.blue10,
    primaryButtonBackgroundHovered: p.blue10,
    primaryButtonBackgroundPressed: p.blue10,
    primaryButtonBackgroundDisabled: p.blue10,
    primaryButtonBorder: p.blue10,
    primaryButtonBorderFocused: p.blue10,
    primaryButtonText: p.blue10,
    primaryButtonTextHovered: p.blue10,
    primaryButtonTextPressed: p.blue10,
    primaryButtonTextDisabled: p.blue10,

    accentButtonBackground: p.blue10,
    accentButtonText: p.blue10,

    menuBackground: p.blue10,
    menuDivider: p.blue10,
    menuIcon: p.blue10,
    menuHeader: p.blue10,
    menuItemBackgroundHovered: p.blue10,
    menuItemBackgroundPressed: p.blue10,
    menuItemText: p.blue10,
    menuItemTextHovered: p.blue10,

    listBackground: p.blue10,
    listText: p.blue10,
    listItemBackgroundHovered: p.blue10,
    listItemBackgroundChecked: p.blue10,
    listItemBackgroundCheckedHovered: p.blue10,

    listHeaderBackgroundHovered: p.blue10,
    listHeaderBackgroundPressed: p.blue10,

    actionLink: p.blue10,
    actionLinkHovered: p.blue10,
    link: p.blue10,
    linkHovered: p.blue10,
    linkPressed: p.blue10,

    buttonBackground: p.blue10,
    buttonContent: p.blue10,
    buttonBorder: p.blue10,
    buttonIcon: p.blue10,

    buttonHoveredBackground: p.blue10,
    buttonHoveredBorder: p.blue10,
    buttonHoveredContent: p.blue10,
    buttonHoveredIcon: p.blue10,

    buttonFocusedBackground: p.blue10,
    buttonFocusedBorder: p.blue10,
    buttonFocusedContent: p.blue10,
    buttonFocusedIcon: p.blue10,

    buttonPressedBackground: p.blue10,
    buttonPressedBorder: p.blue10,
    buttonPressedContent: p.blue10,
    buttonPressedIcon: p.blue10,

    buttonDisabledBackground: p.blue10,
    buttonDisabledBorder: p.blue10,
    buttonDisabledContent: p.blue10,
    buttonDisabledIcon: p.blue10,

    ghostBackground: p.blue10,
    ghostContent: p.blue10,
    ghostBorder: p.blue10,
    ghostIcon: p.blue10,

    ghostHoveredBackground: p.blue10,
    ghostHoveredBorder: p.blue10,
    ghostHoveredContent: p.blue10,
    ghostHoveredIcon: p.blue10,

    ghostFocusedBackground: p.blue10,
    ghostFocusedBorder: p.blue10,
    ghostFocusedContent: p.blue10,
    ghostFocusedIcon: p.blue10,

    ghostPressedBackground: p.blue10,
    ghostPressedBorder: p.blue10,
    ghostPressedContent: p.blue10,
    ghostPressedIcon: p.blue10,

    ghostDisabledBackground: p.blue10,
    ghostDisabledBorder: p.blue10,
    ghostDisabledContent: p.blue10,
    ghostDisabledIcon: p.blue10,

    brandBackground: p.blue10,
    brandContent: p.blue10,
    brandBorder: p.blue10,
    brandIcon: p.blue10,

    brandHoveredBackground: p.blue10,
    brandHoveredBorder: p.blue10,
    brandHoveredContent: p.blue10,
    brandHoveredIcon: p.blue10,

    brandFocusedBackground: p.blue10,
    brandFocusedBorder: p.blue10,
    brandFocusedContent: p.blue10,
    brandFocusedIcon: p.blue10,

    brandPressedBackground: p.blue10,
    brandPressedBorder: p.blue10,
    brandPressedContent: p.blue10,
    brandPressedIcon: p.blue10,

    brandDisabledBackground: p.blue10,
    brandDisabledBorder: p.blue10,
    brandDisabledContent: p.blue10,
    brandDisabledIcon: p.blue10,

    buttonCheckedBackground: p.blue10,
    buttonCheckedContent: p.blue10,
    buttonCheckedHoveredBackground: p.blue10,
    buttonCheckedHoveredContent: p.blue10,

    brandCheckedBackground: p.blue10,
    brandCheckedContent: p.blue10,
    brandCheckedHoveredBackground: p.blue10,
    brandCheckedHoveredContent: p.blue10,

    ghostCheckedBackground: p.blue10,
    ghostCheckedContent: p.blue10,
    ghostCheckedHoveredBackground: p.blue10,
    ghostCheckedHoveredContent: p.blue10,
    ghostCheckedHoveredBorder: p.blue10,

    ghostSecondaryContent: p.blue10,
    ghostFocusedSecondaryContent: p.blue10,
    ghostHoveredSecondaryContent: p.blue10,
    ghostPressedSecondaryContent: p.blue10,

    brandSecondaryContent: p.blue10,
    brandFocusedSecondaryContent: p.blue10,
    brandHoveredSecondaryContent: p.blue10,
    brandPressedSecondaryContent: p.blue10,

    buttonDisabledSecondaryContent: p.blue10,
    buttonHoveredSecondaryContent: p.blue10,
    buttonPressedSecondaryContent: p.blue10,
  };
}

export function getStockApplePalette(): ThemeColorDefinition {
  return {
    ...paletteFromAppleColors({
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
    }),
  };
}

export function getStockAppleDarkPalette(): ThemeColorDefinition {
  return {
    ...paletteFromAppleColors({
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
      successPrimary: '#0EB244',
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
    }),
  };
}
