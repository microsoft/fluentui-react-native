import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { getFluentUIApplePalette } from './fluentAppleColors.ios';

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
    buttonBackgroundDisabled: fluentApple.gray100,
    buttonText: fluentApple.textOnAccent,
    buttonTextHovered: fluentApple.textOnAccent,
    buttonTextChecked: fluentApple.textOnAccent,
    buttonTextCheckedHovered: fluentApple.textOnAccent,
    buttonTextPressed: fluentApple.textOnAccent,
    buttonTextDisabled: fluentApple.textDisabled,
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
    primaryButtonTextPressed: fluentApple.textDisabled,
    primaryButtonTextDisabled: fluentApple.textDisabled,

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

    buttonDisabledBackground: fluentApple.gray100,
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: fluentApple.textDisabled,
    buttonDisabledIcon: fluentApple.iconDisabled,

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
    brandDisabledContent: fluentApple.textDisabled,
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

    buttonDisabledSecondaryContent: fluentApple.textDisabled,
    buttonHoveredSecondaryContent: fluentApple.textPrimary,
    buttonPressedSecondaryContent: fluentApple.textPrimary,
  };
}
