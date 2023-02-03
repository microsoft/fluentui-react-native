import type { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { Appearance } from 'react-native';
import type { ApplePalette } from './appleColors.types.ios';
import { createiOSColorAliasTokens } from './createiOSAliasTokens';

function getFluentUIAppleLightPalette(): ApplePalette {
  return {
    communicationBlue: '#0078D4',
    communicationBlueTint10: '#2B88D8',
    communicationBlueTint20: '#C7E0F4',
    communicationBlueTint30: '#DEECF9',
    dangerPrimary: '#D92C2C',
    dangerTint10: '#DD4242',
    gray20: '#69797E',
    gray25: '#F8F8F8',
    gray30: '#7A7574',
    gray40: '#393939',
    successTint10: '#27AC22',
    warningPrimary: '#FFD335',
    warningTint10: '#FFD94E',

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

    buttonBackground: 'transparent',
    buttonBackgroundFilledPressed: '#2B88D8', //UIColor(light: Colors.primaryTint10(for: window), dark: Colors.primaryTint20(for: window))
    buttonBackgroundFilledDisabled: '#E1E1E1', //surfaceQuaternary
    buttonBorderDisabled: '#E1E1E1', //surfaceQuaternary
    buttonTitleDisabled: '#ACACAC', //textDisabled
    buttonTitleWithFilledBackground: 'white', //textOnAccent
  };
}

function getFluentUIAppleDarkPalette(): ApplePalette {
  return {
    communicationBlue: '#0086F0',
    communicationBlueTint10: '#0078D4',
    communicationBlueTint20: '#004C87',
    communicationBlueTint30: '#043862',
    dangerPrimary: '#E83A3A',
    dangerTint10: '#CC3333',
    gray20: '#69797E',
    gray25: '#F8F8F8',
    gray30: '#7A7574',
    gray40: '#393939',
    successTint10: '#0D9D3D',
    warningPrimary: '#FFC328',
    warningTint10: '#E0AB24',

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

    buttonBackground: 'transparent',
    buttonBackgroundFilledPressed: '#004C87', //UIColor(light: Colors.primaryTint10(for: window), dark: Colors.primaryTint20(for: window))
    buttonBackgroundFilledDisabled: '#404040', //surfaceQuaternary
    buttonBorderDisabled: '#404040', //surfaceQuaternary
    buttonTitleDisabled: '#404040', //textDisabled
    buttonTitleWithFilledBackground: 'black', //textOnAccent
  };
}

/** Creates a palette of colors for the apple theme, using the appropriate FluentUI Apple Palette based on appearance */
export function paletteFromAppleColors(isLightMode: boolean, isElevated: boolean): ThemeColorDefinition {
  const fluentApple = isLightMode ? getFluentUIAppleLightPalette() : getFluentUIAppleDarkPalette();

  const appearance = Appearance.getColorScheme();
  let mode = getCurrentAppearance(appearance, 'light');
  if (mode === 'dark' && isElevated) {
    mode = 'darkElevated';
  }

  return {
    /* Color Alias Tokens */

    ...createiOSColorAliasTokens(mode),

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
    buttonBackground: 'transparent',
    buttonBackgroundChecked: 'transparent',
    buttonBackgroundHovered: 'transparent',
    buttonBackgroundCheckedHovered: 'transparent',
    buttonBackgroundPressed: 'transparent',
    buttonBackgroundDisabled: 'transparent',
    buttonBorder: fluentApple.communicationBlueTint10,
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
    defaultBackground: 'transparent',
    defaultBorder: fluentApple.communicationBlueTint10,
    defaultContent: fluentApple.communicationBlue,
    defaultIcon: fluentApple.communicationBlue,

    defaultHoveredBackground: 'transparent',
    defaultHoveredBorder: fluentApple.communicationBlueTint10,
    defaultHoveredContent: fluentApple.communicationBlue,
    defaultHoveredIcon: fluentApple.communicationBlue,

    defaultFocusedBackground: 'transparent',
    defaultFocusedBorder: fluentApple.communicationBlueTint10,
    defaultFocusedContent: fluentApple.communicationBlue,
    defaultFocusedIcon: fluentApple.communicationBlue,

    defaultPressedBackground: 'transparent',
    defaultPressedBorder: fluentApple.communicationBlueTint30,
    defaultPressedContent: fluentApple.communicationBlueTint20,
    defaultPressedIcon: fluentApple.communicationBlueTint20,

    defaultDisabledBackground: 'transparent',
    defaultDisabledBorder: fluentApple.buttonBorderDisabled,
    defaultDisabledContent: fluentApple.buttonTitleDisabled,
    defaultDisabledIcon: fluentApple.buttonTitleDisabled,

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

    brandedBackground: fluentApple.communicationBlue,
    brandedBorder: 'transparent',
    brandedContent: fluentApple.buttonTitleWithFilledBackground,
    brandedIcon: fluentApple.buttonTitleWithFilledBackground,

    brandedHoveredBackground: fluentApple.communicationBlue,
    brandedHoveredBorder: 'transparent',
    brandedHoveredContent: fluentApple.buttonTitleWithFilledBackground,
    brandedHoveredIcon: fluentApple.buttonTitleWithFilledBackground,

    brandedFocusedBackground: fluentApple.communicationBlue,
    brandedFocusedBorder: 'transparent',
    brandedFocusedContent: fluentApple.buttonTitleWithFilledBackground,
    brandedFocusedIcon: fluentApple.buttonTitleWithFilledBackground,

    brandedPressedBackground: fluentApple.buttonBackgroundFilledPressed,
    brandedPressedBorder: 'transparent',
    brandedPressedContent: fluentApple.buttonTitleWithFilledBackground,
    brandedPressedIcon: fluentApple.buttonTitleWithFilledBackground,

    brandedDisabledBackground: fluentApple.buttonBackgroundFilledDisabled,
    brandedDisabledBorder: 'transparent',
    brandedDisabledContent: fluentApple.buttonTitleWithFilledBackground,
    brandedDisabledIcon: fluentApple.buttonTitleWithFilledBackground,

    defaultCheckedBackground: 'transparent',
    defaultCheckedContent: fluentApple.communicationBlue,
    defaultCheckedHoveredBackground: 'transparent',
    defaultCheckedHoveredContent: fluentApple.communicationBlue,

    brandedCheckedBackground: fluentApple.communicationBlue,
    brandedCheckedContent: fluentApple.buttonTitleWithFilledBackground,
    brandedCheckedHoveredBackground: fluentApple.buttonTitleWithFilledBackground,
    brandedCheckedHoveredContent: fluentApple.buttonTitleWithFilledBackground,

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

    brandedSecondaryContent: fluentApple.buttonTitleWithFilledBackground,
    brandedFocusedSecondaryContent: fluentApple.buttonTitleWithFilledBackground,
    brandedHoveredSecondaryContent: fluentApple.buttonTitleWithFilledBackground,
    brandedPressedSecondaryContent: fluentApple.buttonTitleWithFilledBackground,

    defaultDisabledSecondaryContent: fluentApple.buttonTitleDisabled,
    defaultHoveredSecondaryContent: fluentApple.communicationBlue,
    defaultPressedSecondaryContent: fluentApple.communicationBlueTint20,

    checkboxBackground: fluentApple.communicationBlue,
    checkboxBackgroundDisabled: fluentApple.surfacePrimary,
    checkboxBorderColor: fluentApple.gray600,
    checkmarkColor: fluentApple.iconOnAccent,

    personaActivityGlow: fluentApple.buttonBackground,
    personaActivityRing: fluentApple.surfacePrimary,
  };
}
