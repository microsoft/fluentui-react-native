import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { FluentUIAndroidPalette } from './androidPalette';

/** creates a palette of colors for the android theme, given the FluentUI Android Palette */
export function paletteFromAndroidColors(p: FluentUIAndroidPalette): ThemeColorDefinition {
  return {
    /* PaletteBackgroundColors & PaletteTextColors */

    background: p.surfacesPrimary,
    bodyStandoutBackground: p.surfacesSecondary,
    bodyFrameBackground: p.surfacesTertiary,
    bodyFrameDivider: p.dividersSecondary,
    bodyText: p.textPrimary,
    bodyTextChecked: p.gray950, //TODO
    subText: p.textSecondary,
    bodyDivider: p.dividersPrimary,

    disabledBackground: p.surfacesTertiary,
    disabledText: p.textDisabledHighContrast,
    disabledBodyText: p.textDisabled,
    disabledSubtext: p.gray200, //TODO
    disabledBodySubtext: p.gray300, //TODO

    focusBorder: 'transparent', //TODO
    variantBorder: 'transparent', //TODO
    variantBorderHovered: 'transparent', //TODO
    defaultStateBackground: 'transparent', //TODO

    errorText: p.dangerPrimary,
    warningText: p.warningPrimary,
    errorBackground: p.dangerTint10,
    blockingBackground: p.dangerTint10,
    warningBackground: p.warningPrimary,
    warningHighlight: p.warningTint10,
    successBackground: p.successTint10,

    inputBorder: 'transparent',
    inputBorderHovered: 'transparent',
    inputBackground: 'transparent',
    inputBackgroundChecked: 'transparent',
    inputBackgroundCheckedHovered: 'transparent',
    inputForegroundChecked: p.communicationBlue,
    inputFocusBorderAlt: 'transparent',
    smallInputBorder: 'transparent',
    inputText: p.textPrimary,
    inputTextHovered: p.textPrimary,
    inputPlaceholderText: p.textSecondary,

    buttonBackgroundChecked: p.buttonBackground,
    buttonBackgroundHovered: p.buttonBackground,
    buttonBackgroundCheckedHovered: p.buttonBackground,
    buttonBackgroundPressed: p.buttonBackgroundPressed,
    buttonBackgroundDisabled: p.buttonBackgroundDisabled,
    buttonText: p.textOnAccent,
    buttonTextHovered: '#ffffff', //TODO
    buttonTextChecked: '#ffffff', //TODO
    buttonTextCheckedHovered: '#ffffff', //TODO
    buttonTextPressed: p.textOnAccent,
    buttonTextDisabled: p.buttonTextDisabled,
    buttonBorderDisabled: 'transparent', //TODO
    buttonBorderFocused: 'transparent', //TODO

    primaryButtonBackground: p.buttonBackground,
    primaryButtonBackgroundHovered: p.buttonBackground,
    primaryButtonBackgroundPressed: p.buttonBackgroundPressed,
    primaryButtonBackgroundDisabled: p.buttonBackgroundDisabled,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: p.textOnAccent,
    primaryButtonTextHovered: '#ffffff', //TODO
    primaryButtonTextPressed: '#ffffff', //TODO
    primaryButtonTextDisabled: p.buttonTextDisabled,

    accentButtonBackground: p.buttonBackground,
    accentButtonText: p.textOnAccent,

    menuBackground: p.menuBackground,
    menuDivider: 'transparent',
    menuIcon: p.menuIcon,
    menuHeader: 'transparent', //TODO
    menuItemBackgroundHovered: 'transparent', //TODO
    menuItemBackgroundPressed: 'transparent', //TODO
    menuItemText: p.menuItemText,
    menuItemTextHovered: p.gray900, //TODO

    listBackground: p.listBackground,
    listText: p.menuItemText,
    listItemBackgroundHovered: 'transparent', //TODO
    listItemBackgroundChecked: 'transparent', //TODO
    listItemBackgroundCheckedHovered: 'transparent', //TODO

    listHeaderBackgroundHovered: 'transparent', //TODO
    listHeaderBackgroundPressed: 'transparent', //TODO

    actionLink: 'todo',
    actionLinkHovered: 'todo',
    link: 'todo',
    linkHovered: 'todo',
    linkPressed: 'todo',

    /* ControlColorTokens */

    buttonBackground: p.buttonBackground,
    buttonBorder: 'transparent',
    buttonContent: p.textPrimary,
    buttonIcon: p.iconsSecondary,

    buttonPressedBackground: p.buttonBackgroundPressed,
    buttonPressedBorder: 'transparent',
    buttonPressedContent: p.textOnAccent,
    buttonPressedIcon: p.iconsOnAccent,

    buttonDisabledBackground: p.buttonBackgroundDisabled,
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: p.buttonTextDisabled,
    buttonDisabledIcon: p.buttonTextDisabled,

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: p.textDominant,
    ghostIcon: p.textDominant,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: p.textDominant,
    ghostHoveredIcon: p.textDominant,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: p.textDominant,
    ghostFocusedIcon: p.textDominant,

    ghostPressedBackground: 'transparent',
    ghostPressedBorder: 'transparent',
    ghostPressedContent: p.communicationBlueTint20,
    ghostPressedIcon: p.communicationBlueTint20,

    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: p.iconsDisabled,
    ghostDisabledIcon: p.iconsDisabled,

    brandBackground: p.communicationBlue,
    brandBorder: 'transparent',
    brandContent: p.textDominant,
    brandIcon: p.textDominant,

    brandHoveredBackground: p.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: p.textDominant,
    brandHoveredIcon: p.textDominant,

    brandFocusedBackground: p.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: p.textDominant,
    brandFocusedIcon: p.textDominant,

    brandPressedBackground: p.communicationBlueTint10,
    brandPressedBorder: 'transparent',
    brandPressedContent: p.textDominant,
    brandPressedIcon: p.textDominant,

    brandDisabledBackground: p.gray100,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: p.textDisabled,
    brandDisabledIcon: p.textDisabled,

    buttonCheckedBackground: p.communicationBlueTint10,
    buttonCheckedContent: p.textDominant,
    buttonCheckedHoveredBackground: p.communicationBlueTint10,
    buttonCheckedHoveredContent: p.textDominant,

    brandCheckedBackground: p.communicationBlueTint10,
    brandCheckedContent: p.textDominant,
    brandCheckedHoveredBackground: p.communicationBlueTint10,
    brandCheckedHoveredContent: p.textDominant,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: p.communicationBlueTint20,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: p.communicationBlueTint20,
    ghostCheckedHoveredBorder: 'transparent',

    ghostSecondaryContent: p.iconsSecondary,
    ghostFocusedSecondaryContent: p.iconsSecondary,
    ghostHoveredSecondaryContent: p.iconsSecondary,
    ghostPressedSecondaryContent: p.iconsSecondary,

    brandSecondaryContent: p.iconsSecondary,
    brandFocusedSecondaryContent: p.iconsSecondary,
    brandHoveredSecondaryContent: p.iconsSecondary,
    brandPressedSecondaryContent: p.iconsSecondary,

    buttonDisabledSecondaryContent: p.textSecondary,
    buttonHoveredSecondaryContent: p.iconsSecondary,
    buttonPressedSecondaryContent: p.iconsSecondary,
  };
}
