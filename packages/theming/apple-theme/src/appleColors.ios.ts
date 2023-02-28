import { Appearance } from 'react-native';

import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';

import type { ApplePalette } from './appleColors.types.ios';
import { createiOSColorAliasTokens } from './createiOSAliasTokens';

//TODO: remove and replace with Fluent 2 alias color tokens
function getFluentUIAppleLightPalette(): ApplePalette {
  return {
    communicationBlue: '#0078D4',
    communicationBlueTint10: '#2B88D8',
    communicationBlueTint20: '#C7E0F4',
    communicationBlueTint30: '#DEECF9',
    dangerPrimary: '#D92C2C',
    dangerTint10: '#DD4242',
    gray20: '#69797E',
    gray30: '#7A7574',
    gray40: '#393939',
    successTint10: '#27AC22',
    warningPrimary: '#FFD335',
    warningTint10: '#FFD94E',

    buttonBackgroundFilledPressed: '#2B88D8', //UIColor(light: Colors.primaryTint10(for: window), dark: Colors.primaryTint20(for: window))
    buttonTitleDisabled: '#ACACAC', //textDisabled
  };
}

//TODO: remove and replace with Fluent 2 alias color tokens
function getFluentUIAppleDarkPalette(): ApplePalette {
  return {
    communicationBlue: '#0086F0',
    communicationBlueTint10: '#0078D4',
    communicationBlueTint20: '#004C87',
    communicationBlueTint30: '#043862',
    dangerPrimary: '#E83A3A',
    dangerTint10: '#CC3333',
    gray20: '#69797E',
    gray30: '#7A7574',
    gray40: '#393939',
    successTint10: '#0D9D3D',
    warningPrimary: '#FFC328',
    warningTint10: '#E0AB24',

    buttonBackgroundFilledPressed: '#004C87', //UIColor(light: Colors.primaryTint10(for: window), dark: Colors.primaryTint20(for: window))
    buttonTitleDisabled: '#404040', //textDisabled
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

  const fluent2AliasColorTokens = createiOSColorAliasTokens(mode);

  return {
    /* Color Alias Tokens */

    ...fluent2AliasColorTokens,

    /* PaletteBackgroundColors & PaletteTextColors */

    background: fluent2AliasColorTokens.neutralBackground1,
    bodyStandoutBackground: fluent2AliasColorTokens.neutralBackground4,
    bodyFrameBackground: fluent2AliasColorTokens.neutralBackground1,
    bodyFrameDivider: fluent2AliasColorTokens.neutralStroke2,
    bodyText: fluent2AliasColorTokens.neutralForeground1,
    bodyTextChecked: fluent2AliasColorTokens.neutralForeground1,
    subText: fluent2AliasColorTokens.neutralForeground3,
    bodyDivider: fluent2AliasColorTokens.neutralStroke1,

    disabledBackground: fluent2AliasColorTokens.neutralBackgroundDisabled,
    disabledText: fluent2AliasColorTokens.neutralForegroundDisabled1,
    disabledBodyText: fluent2AliasColorTokens.neutralForegroundDisabled1,
    disabledSubtext: fluent2AliasColorTokens.neutralForegroundDisabled1,
    disabledBodySubtext: fluent2AliasColorTokens.neutralForegroundDisabled1,

    focusBorder: 'transparent',
    variantBorder: fluent2AliasColorTokens.neutralStroke2,
    variantBorderHovered: fluent2AliasColorTokens.neutralStroke2,
    defaultStateBackground: fluent2AliasColorTokens.neutralBackground1,

    errorText: fluentApple.dangerPrimary,
    warningText: fluentApple.warningPrimary,
    errorBackground: fluentApple.dangerTint10,
    blockingBackground: fluentApple.dangerTint10,
    warningBackground: fluentApple.warningPrimary,
    warningHighlight: fluentApple.warningTint10,
    successBackground: fluentApple.successTint10,

    inputBorder: fluent2AliasColorTokens.neutralStroke2,
    inputBorderHovered: fluent2AliasColorTokens.neutralStroke2,
    inputBackground: fluent2AliasColorTokens.neutralBackground1,
    inputBackgroundChecked: fluent2AliasColorTokens.neutralBackground1,
    inputBackgroundCheckedHovered: fluent2AliasColorTokens.neutralBackground1,
    inputForegroundChecked: fluent2AliasColorTokens.neutralForegroundOnColor,
    inputFocusBorderAlt: fluent2AliasColorTokens.neutralStroke1,
    smallInputBorder: fluent2AliasColorTokens.neutralStroke1,
    inputText: fluent2AliasColorTokens.neutralForeground1,
    inputTextHovered: fluent2AliasColorTokens.neutralForeground1,
    inputPlaceholderText: fluent2AliasColorTokens.neutralForeground3,

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
    buttonBorderDisabled: fluent2AliasColorTokens.neutralBackgroundDisabled,
    buttonBorderFocused: fluentApple.communicationBlueTint10,

    primaryButtonBackground: fluentApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentApple.communicationBlue,
    primaryButtonBackgroundPressed: fluentApple.buttonBackgroundFilledPressed,
    primaryButtonBackgroundDisabled: fluent2AliasColorTokens.neutralBackgroundDisabled,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: fluent2AliasColorTokens.neutralForegroundOnColor,
    primaryButtonTextHovered: fluent2AliasColorTokens.neutralForegroundOnColor,
    primaryButtonTextPressed: fluent2AliasColorTokens.neutralForegroundOnColor,
    primaryButtonTextDisabled: fluent2AliasColorTokens.neutralForegroundOnColor,

    accentButtonBackground: fluentApple.communicationBlue,
    accentButtonText: fluent2AliasColorTokens.neutralForegroundOnColor,

    menuBackground: fluent2AliasColorTokens.neutralBackground1,
    menuDivider: fluent2AliasColorTokens.neutralStroke2,
    menuIcon: fluent2AliasColorTokens.neutralForeground3,
    menuHeader: fluent2AliasColorTokens.neutralForeground1,
    menuItemBackgroundHovered: fluent2AliasColorTokens.neutralBackground1,
    menuItemBackgroundPressed: fluent2AliasColorTokens.neutralBackground1,
    menuItemText: fluent2AliasColorTokens.neutralForeground1,
    menuItemTextHovered: fluent2AliasColorTokens.neutralForeground1,

    listBackground: fluent2AliasColorTokens.neutralBackground1,
    listText: fluent2AliasColorTokens.neutralForeground1,
    listItemBackgroundHovered: fluent2AliasColorTokens.neutralBackground1,
    listItemBackgroundChecked: fluent2AliasColorTokens.neutralBackground1,
    listItemBackgroundCheckedHovered: fluent2AliasColorTokens.neutralBackground1,

    listHeaderBackgroundHovered: fluent2AliasColorTokens.neutralForeground1,
    listHeaderBackgroundPressed: fluent2AliasColorTokens.neutralForeground1,

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
    defaultDisabledBorder: fluent2AliasColorTokens.neutralBackgroundDisabled,
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
    brandedContent: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedIcon: fluent2AliasColorTokens.neutralForegroundOnColor,

    brandedHoveredBackground: fluentApple.communicationBlue,
    brandedHoveredBorder: 'transparent',
    brandedHoveredContent: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedHoveredIcon: fluent2AliasColorTokens.neutralForegroundOnColor,

    brandedFocusedBackground: fluentApple.communicationBlue,
    brandedFocusedBorder: 'transparent',
    brandedFocusedContent: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedFocusedIcon: fluent2AliasColorTokens.neutralForegroundOnColor,

    brandedPressedBackground: fluentApple.buttonBackgroundFilledPressed,
    brandedPressedBorder: 'transparent',
    brandedPressedContent: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedPressedIcon: fluent2AliasColorTokens.neutralForegroundOnColor,

    brandedDisabledBackground: fluent2AliasColorTokens.neutralBackgroundDisabled,
    brandedDisabledBorder: 'transparent',
    brandedDisabledContent: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedDisabledIcon: fluent2AliasColorTokens.neutralForegroundOnColor,

    defaultCheckedBackground: 'transparent',
    defaultCheckedContent: fluentApple.communicationBlue,
    defaultCheckedHoveredBackground: 'transparent',
    defaultCheckedHoveredContent: fluentApple.communicationBlue,

    brandedCheckedBackground: fluentApple.communicationBlue,
    brandedCheckedContent: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedCheckedHoveredBackground: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedCheckedHoveredContent: fluent2AliasColorTokens.neutralForegroundOnColor,

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

    brandedSecondaryContent: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedFocusedSecondaryContent: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedHoveredSecondaryContent: fluent2AliasColorTokens.neutralForegroundOnColor,
    brandedPressedSecondaryContent: fluent2AliasColorTokens.neutralForegroundOnColor,

    defaultDisabledSecondaryContent: fluentApple.buttonTitleDisabled,
    defaultHoveredSecondaryContent: fluentApple.communicationBlue,
    defaultPressedSecondaryContent: fluentApple.communicationBlueTint20,

    checkboxBackground: fluentApple.communicationBlue,
    checkboxBackgroundDisabled: fluent2AliasColorTokens.neutralBackground1,
    checkboxBorderColor: globalTokens.color.grey26,
    checkmarkColor: fluent2AliasColorTokens.neutralForegroundOnColor,

    personaActivityGlow: 'transparent',
    personaActivityRing: fluent2AliasColorTokens.neutralBackground1,
  };
}
