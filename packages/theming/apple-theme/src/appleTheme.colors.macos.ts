import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { ApplePalette } from './fluentAppleColors.macos';
import { AppleSemanticPalette } from './appleSemanticColors.macos';

/** creates a palette of colors for the apple theme, given the FluentUI Apple Palette and Apple Semantic Palette */
export function paletteFromAppleColors(fluentApple: ApplePalette, appleSemantic: AppleSemanticPalette): ThemeColorDefinition {
  return {
    /* PaletteBackgroundColors & PaletteTextColors */

    background: appleSemantic.windowBackgroundColor,
    bodyStandoutBackground: appleSemantic.underPageBackgroundColor,
    bodyFrameBackground: appleSemantic.windowBackgroundColor,
    bodyFrameDivider: appleSemantic.separatorColor,
    bodyText: appleSemantic.textColor,
    bodyTextChecked: appleSemantic.selectedTextColor,
    subText: appleSemantic.placeholderTextColor,
    bodyDivider: appleSemantic.separatorColor,

    disabledBackground: fluentApple.gray100,
    disabledText: appleSemantic.tertiaryLabelColor,
    disabledBodyText: appleSemantic.tertiaryLabelColor,
    disabledSubtext: appleSemantic.quaternaryLabelColor,
    disabledBodySubtext: appleSemantic.quaternaryLabelColor,

    focusBorder: 'transparent',
    variantBorder: appleSemantic.separatorColor,
    variantBorderHovered: appleSemantic.separatorColor,
    defaultStateBackground: appleSemantic.controlBackgroundColor,

    errorText: fluentApple.dangerPrimary,
    warningText: fluentApple.warningPrimary,
    errorBackground: fluentApple.dangerTint10,
    blockingBackground: fluentApple.dangerTint10,
    warningBackground: fluentApple.warningPrimary,
    warningHighlight: fluentApple.warningTint10,
    successBackground: fluentApple.successTint10,

    inputBorder: appleSemantic.separatorColor,
    inputBorderHovered: appleSemantic.separatorColor,
    inputBackground: appleSemantic.textBackgroundColor,
    inputBackgroundChecked: appleSemantic.selectedContentBackgroundColor,
    inputBackgroundCheckedHovered: appleSemantic.selectedContentBackgroundColor,
    inputForegroundChecked: fluentApple.communicationBlue,
    inputFocusBorderAlt: appleSemantic.keyboardFocusIndicatorColor,
    smallInputBorder: appleSemantic.separatorColor,
    inputText: appleSemantic.textColor,
    inputTextHovered: appleSemantic.textColor,
    inputPlaceholderText: appleSemantic.placeholderTextColor,

    buttonBackgroundChecked: fluentApple.communicationBlueTint10,
    buttonBackgroundHovered: fluentApple.communicationBlue,
    buttonBackgroundCheckedHovered: fluentApple.communicationBlueTint10,
    buttonBackgroundPressed: fluentApple.communicationBlueTint10,
    buttonBackgroundDisabled: fluentApple.gray100,
    buttonText: appleSemantic.controlTextColor,
    buttonTextHovered: appleSemantic.controlTextColor,
    buttonTextChecked: appleSemantic.controlTextColor,
    buttonTextCheckedHovered: appleSemantic.controlTextColor,
    buttonTextPressed: appleSemantic.controlTextColor,
    buttonTextDisabled: appleSemantic.controlTextColor,
    buttonBorderDisabled: 'transparent',
    buttonBorderFocused: 'transparent',

    primaryButtonBackground: fluentApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentApple.communicationBlue,
    primaryButtonBackgroundPressed: fluentApple.communicationBlueTint10,
    primaryButtonBackgroundDisabled: fluentApple.gray100,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: appleSemantic.controlTextColor,
    primaryButtonTextHovered: appleSemantic.controlTextColor,
    primaryButtonTextPressed: appleSemantic.controlTextColor,
    primaryButtonTextDisabled: appleSemantic.disabledControlTextColor,

    accentButtonBackground: fluentApple.communicationBlueTint10,
    accentButtonText: appleSemantic.controlTextColor,

    menuBackground: appleSemantic.alternatingEvenContentBackgroundColor,
    menuDivider: appleSemantic.separatorColor,
    menuIcon: appleSemantic.textColor,
    menuHeader: appleSemantic.headerTextColor,
    menuItemBackgroundHovered: appleSemantic.alternatingOddContentBackgroundColor,
    menuItemBackgroundPressed: appleSemantic.selectedContentBackgroundColor,
    menuItemText: appleSemantic.textColor,
    menuItemTextHovered: appleSemantic.textColor,

    listBackground: appleSemantic.alternatingOddContentBackgroundColor,
    listText: appleSemantic.textColor,
    listItemBackgroundHovered: appleSemantic.alternatingOddContentBackgroundColor,
    listItemBackgroundChecked: appleSemantic.selectedContentBackgroundColor,
    listItemBackgroundCheckedHovered: appleSemantic.selectedContentBackgroundColor,

    listHeaderBackgroundHovered: appleSemantic.headerTextColor,
    listHeaderBackgroundPressed: appleSemantic.headerTextColor,

    actionLink: appleSemantic.linkColor,
    actionLinkHovered: appleSemantic.linkColor,
    link: appleSemantic.linkColor,
    linkHovered: appleSemantic.linkColor,
    linkPressed: appleSemantic.selectedControlColor,

    /* ControlColorTokens */

    buttonBackground: fluentApple.communicationBlue,
    buttonBorder: 'transparent',
    buttonContent: appleSemantic.controlTextColor,
    buttonIcon: appleSemantic.controlTextColor,

    buttonHoveredBackground: fluentApple.communicationBlue,
    buttonHoveredBorder: 'transparent',
    buttonHoveredContent: appleSemantic.controlTextColor,
    buttonHoveredIcon: appleSemantic.controlTextColor,

    buttonFocusedBackground: fluentApple.communicationBlue,
    buttonFocusedBorder: 'transparent',
    buttonFocusedContent: appleSemantic.controlTextColor,
    buttonFocusedIcon: appleSemantic.controlTextColor,

    buttonPressedBackground: fluentApple.communicationBlueTint10,
    buttonPressedBorder: 'transparent',
    buttonPressedContent: appleSemantic.controlTextColor,
    buttonPressedIcon: appleSemantic.controlTextColor,

    buttonDisabledBackground: fluentApple.gray100,
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: appleSemantic.controlTextColor,
    buttonDisabledIcon: appleSemantic.controlTextColor,

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: appleSemantic.controlTextColor,
    ghostIcon: appleSemantic.controlTextColor,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: appleSemantic.controlTextColor,
    ghostHoveredIcon: appleSemantic.controlTextColor,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: appleSemantic.controlTextColor,
    ghostFocusedIcon: appleSemantic.controlTextColor,

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
    brandContent: appleSemantic.controlTextColor,
    brandIcon: appleSemantic.controlTextColor,

    brandHoveredBackground: fluentApple.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: appleSemantic.controlTextColor,
    brandHoveredIcon: appleSemantic.controlTextColor,

    brandFocusedBackground: fluentApple.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: appleSemantic.controlTextColor,
    brandFocusedIcon: appleSemantic.controlTextColor,

    brandPressedBackground: fluentApple.communicationBlueTint10,
    brandPressedBorder: 'transparent',
    brandPressedContent: appleSemantic.controlTextColor,
    brandPressedIcon: appleSemantic.controlTextColor,

    brandDisabledBackground: fluentApple.gray100,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: appleSemantic.controlTextColor,
    brandDisabledIcon: appleSemantic.controlTextColor,

    buttonCheckedBackground: appleSemantic.selectedContentBackgroundColor,
    buttonCheckedContent: appleSemantic.controlTextColor,
    buttonCheckedHoveredBackground: appleSemantic.selectedContentBackgroundColor,
    buttonCheckedHoveredContent: appleSemantic.controlTextColor,

    brandCheckedBackground: fluentApple.communicationBlueTint10,
    brandCheckedContent: appleSemantic.controlTextColor,
    brandCheckedHoveredBackground: fluentApple.communicationBlueTint10,
    brandCheckedHoveredContent: appleSemantic.controlTextColor,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: fluentApple.communicationBlueTint20,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: fluentApple.communicationBlueTint20,
    ghostCheckedHoveredBorder: 'transparent',

    ghostSecondaryContent: appleSemantic.secondaryLabelColor,
    ghostFocusedSecondaryContent: appleSemantic.secondaryLabelColor,
    ghostHoveredSecondaryContent: appleSemantic.secondaryLabelColor,
    ghostPressedSecondaryContent: appleSemantic.secondaryLabelColor,

    brandSecondaryContent: appleSemantic.secondaryLabelColor,
    brandFocusedSecondaryContent: appleSemantic.secondaryLabelColor,
    brandHoveredSecondaryContent: appleSemantic.secondaryLabelColor,
    brandPressedSecondaryContent: appleSemantic.secondaryLabelColor,

    buttonDisabledSecondaryContent: appleSemantic.tertiaryLabelColor,
    buttonHoveredSecondaryContent: appleSemantic.tertiaryLabelColor,
    buttonPressedSecondaryContent: appleSemantic.tertiaryLabelColor,
  };
}
