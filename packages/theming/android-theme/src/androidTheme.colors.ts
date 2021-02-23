import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { FluentUIAndroidPalette } from './fluentAndroidColors';

/** creates a palette of colors for the android theme, given the FluentUI Android Palette */
export function paletteFromAndroidColors(p: FluentUIAndroidPalette, isInverted: boolean): ThemeColorDefinition {
  return {
    /* PaletteBackgroundColors & PaletteTextColors */

    background: isInverted ? p.black : p.white, // Surfaces.Primary
    bodyStandoutBackground: isInverted ? p.gray950 : p.gray25, //Surfaces.Secondary
    bodyFrameBackground: isInverted ? p.gray900 : p.gray50, //Surfaces.Tertiary
    bodyFrameDivider: isInverted ? p.gray700 : p.gray200, //Dividers.onSecondary
    bodyText: isInverted ? p.gray100 : p.gray900, //Texts.Primary
    bodyTextChecked: p.gray950, //TODO
    subText: isInverted ? p.gray400 : p.gray500, //Texts.Secondary
    bodyDivider: isInverted ? p.gray800 : p.gray100, //Dividers.onPrimary

    disabledBackground: isInverted ? p.gray900 : p.gray50, //Surfaces.Tertiary
    disabledText: isInverted ? p.gray400 : p.gray500, //Texts.Disabled.HighContrast
    disabledBodyText: isInverted ? p.gray600 : p.gray300, //Texts.Disabled.Base
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
    inputText: isInverted ? p.gray100 : p.gray900, //Texts.Primary
    inputTextHovered: isInverted ? p.gray100 : p.gray900, //Texts.Primary
    inputPlaceholderText: isInverted ? p.gray400 : p.gray500, //Texts.Secondary

    buttonBackgroundChecked: p.communicationBlueTint10,
    buttonBackgroundHovered: p.communicationBlue,
    buttonBackgroundCheckedHovered: p.communicationBlueTint10,
    buttonBackgroundPressed: p.communicationBlueTint10,
    buttonBackgroundDisabled: isInverted ? p.communicationBlue : p.gray50,
    buttonText: isInverted ? p.black : p.white,
    buttonTextHovered: '#ffffff', //TODO
    buttonTextChecked: '#ffffff', //TODO
    buttonTextCheckedHovered: '#ffffff', //TODO
    buttonTextPressed: isInverted ? p.black : p.white,
    buttonTextDisabled: isInverted ? p.communicationBlueTint20 : p.gray300,
    buttonBorderDisabled: 'transparent', //TODO
    buttonBorderFocused: 'transparent', //TODO

    primaryButtonBackground: p.communicationBlue,
    primaryButtonBackgroundHovered: p.communicationBlue,
    primaryButtonBackgroundPressed: p.communicationBlueTint10,
    primaryButtonBackgroundDisabled: isInverted ? p.communicationBlue : p.gray50,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: isInverted ? p.black : p.white,
    primaryButtonTextHovered: '#ffffff', //TODO
    primaryButtonTextPressed: '#ffffff', //TODO
    primaryButtonTextDisabled: isInverted ? p.communicationBlueTint20 : p.gray300,

    accentButtonBackground: p.communicationBlueTint10,
    accentButtonText: isInverted ? p.black : p.white,

    menuBackground: isInverted ? p.gray800 : p.white,
    menuDivider: 'transparent',
    menuIcon: isInverted ? p.gray500 : p.gray400,
    menuHeader: 'transparent', //TODO
    menuItemBackgroundHovered: 'transparent', //TODO
    menuItemBackgroundPressed: 'transparent', //TODO
    menuItemText: isInverted ? p.gray100 : p.gray900,
    menuItemTextHovered: p.gray900, //TODO

    listBackground: isInverted ? p.gray950 : p.white,
    listText: isInverted ? p.gray100 : p.gray900,
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

    buttonBackground: p.communicationBlue,
    buttonBorder: 'transparent',
    buttonContent: isInverted ? p.gray900 : p.white,
    buttonIcon: isInverted ? p.gray500 : p.gray400,

    buttonPressedBackground: p.communicationBlueShade20,
    buttonPressedBorder: 'transparent',
    buttonPressedContent: isInverted ? p.black : p.white,
    buttonPressedIcon: isInverted ? p.black : p.white,

    buttonDisabledBackground: isInverted ? p.communicationBlueTint10 : p.gray50,
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: isInverted ? p.communicationBlueTint20 : p.gray300,
    buttonDisabledIcon: isInverted ? p.communicationBlueTint20 : p.gray300,

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: isInverted ? p.white : p.gray900,
    ghostIcon: isInverted ? p.white : p.gray900,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: isInverted ? p.white : p.gray900,
    ghostHoveredIcon: isInverted ? p.white : p.gray900,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: isInverted ? p.white : p.gray900,
    ghostFocusedIcon: isInverted ? p.white : p.gray900,

    ghostPressedBackground: 'transparent',
    ghostPressedBorder: 'transparent',
    ghostPressedContent: p.communicationBlueTint20,
    ghostPressedIcon: p.communicationBlueTint20,

    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: isInverted ? p.gray600 : p.gray300,
    ghostDisabledIcon: isInverted ? p.gray600 : p.gray300,

    brandBackground: p.communicationBlue,
    brandBorder: 'transparent',
    brandContent: isInverted ? p.white : p.gray900,
    brandIcon: isInverted ? p.white : p.gray900,

    brandHoveredBackground: p.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: isInverted ? p.white : p.gray900,
    brandHoveredIcon: isInverted ? p.white : p.gray900,

    brandFocusedBackground: p.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: isInverted ? p.white : p.gray900,
    brandFocusedIcon: isInverted ? p.white : p.gray900,

    brandPressedBackground: p.communicationBlueTint10,
    brandPressedBorder: 'transparent',
    brandPressedContent: isInverted ? p.white : p.gray900,
    brandPressedIcon: isInverted ? p.white : p.gray900,

    brandDisabledBackground: p.gray100,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: isInverted ? p.gray600 : p.gray300,
    brandDisabledIcon: isInverted ? p.gray600 : p.gray300,

    buttonCheckedBackground: p.communicationBlueTint10,
    buttonCheckedContent: isInverted ? p.white : p.gray900,
    buttonCheckedHoveredBackground: p.communicationBlueTint10,
    buttonCheckedHoveredContent: isInverted ? p.white : p.gray900,

    brandCheckedBackground: p.communicationBlueTint10,
    brandCheckedContent: isInverted ? p.white : p.gray900,
    brandCheckedHoveredBackground: p.communicationBlueTint10,
    brandCheckedHoveredContent: isInverted ? p.white : p.gray900,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: p.communicationBlueTint20,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: p.communicationBlueTint20,
    ghostCheckedHoveredBorder: 'transparent',

    ghostSecondaryContent: isInverted ? p.gray400 : p.gray500,
    ghostFocusedSecondaryContent: isInverted ? p.gray400 : p.gray500,
    ghostHoveredSecondaryContent: isInverted ? p.gray400 : p.gray500,
    ghostPressedSecondaryContent: isInverted ? p.gray400 : p.gray500,

    brandSecondaryContent: isInverted ? p.gray400 : p.gray500,
    brandFocusedSecondaryContent: isInverted ? p.gray400 : p.gray500,
    brandHoveredSecondaryContent: isInverted ? p.gray400 : p.gray500,
    brandPressedSecondaryContent: isInverted ? p.gray400 : p.gray500,

    buttonDisabledSecondaryContent: isInverted ? p.gray600 : p.gray300,
    buttonHoveredSecondaryContent: isInverted ? p.gray400 : p.gray500,
    buttonPressedSecondaryContent: isInverted ? p.gray400 : p.gray500,
  };
}
