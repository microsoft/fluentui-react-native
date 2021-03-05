import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { DynamicColorIOS } from 'react-native';
import { ApplePalette } from './appleColors.types.ios';

function getFluentUIApplePalette(): ApplePalette {
  return {
    blue10: '#4F6BED',
    blueMagenta20: '#8764B8',
    blueMagenta30: '#5C2E91',
    communicationBlue: DynamicColorIOS({
      light: '#0078D4',
      dark: '#1890F1',
    }),
    communicationBlueShade10: DynamicColorIOS({
      light: '#106EBE',
      dark: '#1890F1',
    }),
    communicationBlueShade20: DynamicColorIOS({
      light: '#005A9E',
      dark: '#3AA0F3',
    }),
    communicationBlueShade30: DynamicColorIOS({
      light: '#004578',
      dark: '#6CB8F6',
    }),
    communicationBlueTint10: DynamicColorIOS({
      light: '#2B88D8',
      dark: '#0078D4',
    }),
    communicationBlueTint20: DynamicColorIOS({
      light: '#C7E0F4',
      dark: '#004C87',
    }),
    communicationBlueTint30: DynamicColorIOS({
      light: '#DEECF9',
      dark: '#043862',
    }),
    communicationBlueTint40: DynamicColorIOS({
      light: '#EFF6FC',
      dark: '#092C47',
    }),

    cyan20: '#038387',
    cyan30: '#005B70',
    cyanBlue10: '#0078D4',
    cyanBlue20: '#004E8C',
    dangerPrimary: DynamicColorIOS({
      light: '#D92C2C',
      dark: '#clear',
    }),
    dangerShade10: DynamicColorIOS({
      light: '#C32727',
      dark: '#clear',
    }),
    dangerShade20: DynamicColorIOS({
      light: '#A52121',
      dark: '#clear',
    }),
    dangerShade30: DynamicColorIOS({
      light: '#791818',
      dark: '#clear',
    }),
    dangerTint10: DynamicColorIOS({
      light: '#DD4242',
      dark: '#clear',
    }),
    dangerTint20: DynamicColorIOS({
      light: '#E87979',
      dark: '#clear',
    }),
    dangerTint30: DynamicColorIOS({
      light: '#F4B9B9',
      dark: '#clear',
    }),
    dangerTint40: DynamicColorIOS({
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
    presenceAvailable: DynamicColorIOS({
      light: '#6BB700',
      dark: '#92C353',
    }),
    presenceAway: DynamicColorIOS({
      light: '#FFAA44',
      dark: '#F8D22A',
    }),
    presenceBlocked: DynamicColorIOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceBusy: DynamicColorIOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceDnd: DynamicColorIOS({
      light: '#C50F1F',
      dark: '#D74553',
    }),
    presenceOffline: DynamicColorIOS({
      light: '#8A8886',
      dark: '#979593',
    }),
    presenceOof: DynamicColorIOS({
      light: '#B4009E',
      dark: '#E959D9',
    }),
    presenceUnknown: DynamicColorIOS({
      light: '#8A8886',
      dark: '#979593',
    }),
    red10: '#D13438',
    red20: '#A4262C',
    successPrimary: DynamicColorIOS({
      light: '#13A10E',
      dark: '#979593',
    }),
    successShade10: DynamicColorIOS({
      light: '#11910D',
      dark: '#20BA53',
    }),
    successShade20: DynamicColorIOS({
      light: '#0F7A0B',
      dark: '#3BC569',
    }),
    successShade30: DynamicColorIOS({
      light: '#0B5A08',
      dark: '#67D48B',
    }),
    successTint10: DynamicColorIOS({
      light: '#27AC22',
      dark: '#0D9D3D',
    }),
    successTint20: DynamicColorIOS({
      light: '#5EC65A',
      dark: '#096B29',
    }),
    successTint30: DynamicColorIOS({
      light: '#A7E3A5',
      dark: '#043615',
    }),
    successTint40: DynamicColorIOS({
      light: '#CEF0CD',
      dark: '#021D0B',
    }),
    warningPrimary: DynamicColorIOS({
      light: '#FFD335',
      dark: '#FFC328',
    }),
    warningShade10: DynamicColorIOS({
      light: '#E6BE30',
      dark: '#FFC83E',
    }),
    warningShade20: DynamicColorIOS({
      light: '#C2A129',
      dark: '#FFDD15',
    }),
    warningShade30: DynamicColorIOS({
      light: '#8F761E',
      dark: '#FFDD87',
    }),
    warningTint10: DynamicColorIOS({
      light: '#FFD94E',
      dark: '#E0AB24',
    }),
    warningTint20: DynamicColorIOS({
      light: '#FFE586',
      dark: '#997518',
    }),
    warningTint30: DynamicColorIOS({
      light: '#FFF2C3',
      dark: '#4D3A0C',
    }),
    warningTint40: DynamicColorIOS({
      light: '#FFF8DF',
      dark: '#291F07',
    }),

    textDominant: DynamicColorIOS({
      light: '#212121',
      dark: 'white',
    }), //= UIColor(light: gray900, lightHighContrast: .black, dark: .white)
    textPrimary: DynamicColorIOS({
      light: '#212121',
      dark: '#E1E1E1',
    }), //= UIColor(light: gray900, lightHighContrast: .black, dark: gray100, darkHighContrast: .white)
    textSecondary: DynamicColorIOS({
      light: '#6E6E6E',
      dark: '#919191',
    }), //= UIColor(light: gray500, lightHighContrast: gray700, dark: gray400, darkHighContrast: gray200)
    textDisabled: DynamicColorIOS({
      light: '#ACACAC',
      dark: '#404040',
    }), //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    textOnAccent: DynamicColorIOS({
      light: 'white',
      dark: 'black',
    }), //= UIColor(light: .white, dark: .black)

    iconPrimary: DynamicColorIOS({
      light: '#6E6E6E',
      dark: '#303030',
    }), //= UIColor(light: gray500, lightHighContrast: gray700, dark: .white)
    iconSecondary: DynamicColorIOS({
      light: '#919191',
      dark: '#404040',
    }), //= UIColor(light: gray400, lightHighContrast: gray600, dark: gray500, darkHighContrast: gray300, darkElevated: gray400)
    iconDisabled: DynamicColorIOS({
      light: '#ACACAC',
      dark: '#6E6E6E',
    }), //= UIColor(light: gray300, lightHighContrast: gray500, dark: gray600, darkHighContrast: gray400)
    iconOnAccent: DynamicColorIOS({
      light: 'white',
      dark: 'black',
    }), //= UIColor(light: .white, dark: .black)

    surfacePrimary: DynamicColorIOS({
      light: 'white',
      dark: 'black',
    }), //= UIColor(light: .white, dark: .black, darkElevated: gray950)
    surfaceSecondary: DynamicColorIOS({
      light: '#F8F8F8',
      dark: '#141414',
    }), //= UIColor(light: gray25, dark: gray950, darkElevated: gray900)
    surfaceTertiary: DynamicColorIOS({
      light: '#F1F1F1',
      dark: '#212121',
    }), //= UIColor(light: gray50, dark: gray900, darkElevated: gray800)
    surfaceQuaternary: DynamicColorIOS({
      light: '#E1E1E1',
      dark: '#404040',
    }), //= UIColor(light: gray100, dark: gray600)

    dividerOnPrimary: DynamicColorIOS({
      light: '#E1E1E1',
      dark: '#292929',
    }), //= UIColor(light: gray100, dark: gray800, darkElevated: gray700)
    dividerOnSecondary: DynamicColorIOS({
      light: '#C8C8C8',
      dark: '#303030',
    }), //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
    dividerOnTertiary: DynamicColorIOS({
      light: '#C8C8C8',
      dark: '#303030',
    }), //= UIColor(light: gray200, dark: gray700, darkElevated: gray600)
  };
}

/** creates a palette of colors for the apple theme, given the FluentUI Apple Palette and Apple Semantic Palette */
export function paletteFromAppleColors(): ThemeColorDefinition {
  const fluentApple = getFluentUIApplePalette();

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
    buttonDisabledContent: fluentApple.textOnAccent,
    buttonDisabledIcon: fluentApple.textOnAccent,

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
    ghostDisabledContent: fluentApple.communicationBlueTint20,
    ghostDisabledIcon: fluentApple.communicationBlueTint20,

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
