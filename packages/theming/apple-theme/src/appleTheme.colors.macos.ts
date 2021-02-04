import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { FluentUIApplePalette } from './fluentAppleColors.macos';
import { AppleSemanticPalette } from './applePlatformColors.macos';

/** creates a palette of colors for the apple theme, given the FluentUI Apple Palette and Apple Semantic Palette */
export function paletteFromAppleColors(fluentUIApple: FluentUIApplePalette, applePlatform: AppleSemanticPalette): ThemeColorDefinition {
  return {
    /* PaletteBackgroundColors & PaletteTextColors */

    background: applePlatform.windowBackgroundColor,
    bodyStandoutBackground: applePlatform.underPageBackgroundColor,
    bodyFrameBackground: applePlatform.windowBackgroundColor,
    bodyFrameDivider: applePlatform.separatorColor,
    bodyText: applePlatform.textColor,
    bodyTextChecked: applePlatform.selectedTextColor,
    subText: applePlatform.placeholderTextColor,
    bodyDivider: applePlatform.separatorColor,

    disabledBackground: fluentUIApple.gray100,
    disabledText: applePlatform.tertiaryLabelColor,
    disabledBodyText: applePlatform.tertiaryLabelColor,
    disabledSubtext: applePlatform.quaternaryLabelColor,
    disabledBodySubtext: applePlatform.quaternaryLabelColor,

    focusBorder: 'transparent',
    variantBorder: applePlatform.separatorColor,
    variantBorderHovered: applePlatform.separatorColor,
    defaultStateBackground: applePlatform.controlBackgroundColor,

    errorText: fluentUIApple.dangerPrimary,
    warningText: fluentUIApple.warningPrimary,
    errorBackground: fluentUIApple.dangerTint10,
    blockingBackground: fluentUIApple.dangerTint10,
    warningBackground: fluentUIApple.warningPrimary,
    warningHighlight: fluentUIApple.warningTint10,
    successBackground: fluentUIApple.successTint10,

    inputBorder: applePlatform.separatorColor,
    inputBorderHovered: applePlatform.separatorColor,
    inputBackground: applePlatform.textBackgroundColor,
    inputBackgroundChecked: applePlatform.selectedContentBackgroundColor,
    inputBackgroundCheckedHovered: applePlatform.selectedContentBackgroundColor,
    inputForegroundChecked: fluentUIApple.communicationBlue,
    inputFocusBorderAlt: applePlatform.keyboardFocusIndicatorColor,
    smallInputBorder: applePlatform.separatorColor,
    inputText: applePlatform.textColor,
    inputTextHovered: applePlatform.textColor,
    inputPlaceholderText: applePlatform.placeholderTextColor,

    buttonBackgroundChecked: fluentUIApple.communicationBlueTint10,
    buttonBackgroundHovered: fluentUIApple.communicationBlue,
    buttonBackgroundCheckedHovered: fluentUIApple.communicationBlueTint10,
    buttonBackgroundPressed: fluentUIApple.communicationBlueTint10,
    buttonBackgroundDisabled: fluentUIApple.gray100,
    buttonText: applePlatform.controlTextColor,
    buttonTextHovered: applePlatform.controlTextColor,
    buttonTextChecked: applePlatform.controlTextColor,
    buttonTextCheckedHovered: applePlatform.controlTextColor,
    buttonTextPressed: applePlatform.controlTextColor,
    buttonTextDisabled: applePlatform.disabledControlTextColor,
    buttonBorderDisabled: 'transparent',
    buttonBorderFocused: 'transparent',

    primaryButtonBackground: fluentUIApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentUIApple.communicationBlue,
    primaryButtonBackgroundPressed: fluentUIApple.communicationBlueTint10,
    primaryButtonBackgroundDisabled: fluentUIApple.gray100,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: applePlatform.controlTextColor,
    primaryButtonTextHovered: applePlatform.controlTextColor,
    primaryButtonTextPressed: applePlatform.controlTextColor,
    primaryButtonTextDisabled: applePlatform.disabledControlTextColor,

    accentButtonBackground: fluentUIApple.communicationBlueTint10,
    accentButtonText: applePlatform.controlTextColor,

    menuBackground: 'transparent',
    menuDivider: applePlatform.separatorColor,
    menuIcon: applePlatform.textColor,
    menuHeader: applePlatform.headerTextColor,
    menuItemBackgroundHovered: 'transparent',
    menuItemBackgroundPressed: applePlatform.selectedContentBackgroundColor,
    menuItemText: applePlatform.textColor,
    menuItemTextHovered: applePlatform.textColor,

    listBackground: 'transparent',
    listText: applePlatform.textColor,
    listItemBackgroundHovered: 'transparent',
    listItemBackgroundChecked: applePlatform.selectedContentBackgroundColor,
    listItemBackgroundCheckedHovered: applePlatform.selectedContentBackgroundColor,

    listHeaderBackgroundHovered: applePlatform.headerTextColor,
    listHeaderBackgroundPressed: applePlatform.headerTextColor,

    actionLink: applePlatform.linkColor,
    actionLinkHovered: applePlatform.linkColor,
    link: applePlatform.linkColor,
    linkHovered: applePlatform.linkColor,
    linkPressed: applePlatform.selectedControlColor,

    /* ControlColorTokens */

    buttonBackground: applePlatform.controlColor,
    buttonBorder: 'transparent',
    buttonContent: applePlatform.controlTextColor,
    buttonIcon: applePlatform.controlTextColor,

    buttonHoveredBackground: applePlatform.controlColor,
    buttonHoveredBorder: 'transparent',
    buttonHoveredContent: applePlatform.controlTextColor,
    buttonHoveredIcon: applePlatform.controlTextColor,

    buttonFocusedBackground: applePlatform.controlColor,
    buttonFocusedBorder: 'transparent',
    buttonFocusedContent: applePlatform.controlTextColor,
    buttonFocusedIcon: applePlatform.controlTextColor,

    buttonPressedBackground: applePlatform.selectedControlColor,
    buttonPressedBorder: 'transparent',
    buttonPressedContent: applePlatform.selectedControlTextColor,
    buttonPressedIcon: applePlatform.selectedControlTextColor,

    buttonDisabledBackground: applePlatform.controlColor,
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: applePlatform.disabledControlTextColor,
    buttonDisabledIcon: applePlatform.disabledControlTextColor,

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: applePlatform.controlTextColor,
    ghostIcon: applePlatform.controlTextColor,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: applePlatform.controlTextColor,
    ghostHoveredIcon: applePlatform.controlTextColor,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: applePlatform.controlTextColor,
    ghostFocusedIcon: applePlatform.controlTextColor,

    ghostPressedBackground: 'transparent',
    ghostPressedBorder: 'transparent',
    ghostPressedContent: fluentUIApple.communicationBlueTint20,
    ghostPressedIcon: fluentUIApple.communicationBlueTint20,

    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: applePlatform.disabledControlTextColor,
    ghostDisabledIcon: applePlatform.disabledControlTextColor,

    brandBackground: fluentUIApple.communicationBlue,
    brandBorder: 'transparent',
    brandContent: applePlatform.controlTextColor,
    brandIcon: applePlatform.controlTextColor,

    brandHoveredBackground: fluentUIApple.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: applePlatform.controlTextColor,
    brandHoveredIcon: applePlatform.controlTextColor,

    brandFocusedBackground: fluentUIApple.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: applePlatform.controlTextColor,
    brandFocusedIcon: applePlatform.controlTextColor,

    brandPressedBackground: fluentUIApple.communicationBlueTint10,
    brandPressedBorder: 'transparent',
    brandPressedContent: applePlatform.controlTextColor,
    brandPressedIcon: applePlatform.controlTextColor,

    brandDisabledBackground: fluentUIApple.gray100,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: applePlatform.disabledControlTextColor,
    brandDisabledIcon: applePlatform.controlTextColor,

    buttonCheckedBackground: fluentUIApple.communicationBlueTint10,
    buttonCheckedContent: applePlatform.controlTextColor,
    buttonCheckedHoveredBackground: fluentUIApple.communicationBlueTint10,
    buttonCheckedHoveredContent: applePlatform.controlTextColor,

    brandCheckedBackground: fluentUIApple.communicationBlueTint10,
    brandCheckedContent: applePlatform.controlTextColor,
    brandCheckedHoveredBackground: fluentUIApple.communicationBlueTint10,
    brandCheckedHoveredContent: applePlatform.controlTextColor,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: fluentUIApple.communicationBlueTint20,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: fluentUIApple.communicationBlueTint20,
    ghostCheckedHoveredBorder: 'transparent',

    ghostSecondaryContent: applePlatform.secondaryLabelColor,
    ghostFocusedSecondaryContent: applePlatform.secondaryLabelColor,
    ghostHoveredSecondaryContent: applePlatform.secondaryLabelColor,
    ghostPressedSecondaryContent: applePlatform.secondaryLabelColor,

    brandSecondaryContent: applePlatform.secondaryLabelColor,
    brandFocusedSecondaryContent: applePlatform.secondaryLabelColor,
    brandHoveredSecondaryContent: applePlatform.secondaryLabelColor,
    brandPressedSecondaryContent: applePlatform.tertiaryLabelColor,

    buttonDisabledSecondaryContent: applePlatform.disabledControlTextColor,
    buttonHoveredSecondaryContent: applePlatform.secondaryLabelColor,
    buttonPressedSecondaryContent: applePlatform.tertiaryLabelColor,
  };
}
