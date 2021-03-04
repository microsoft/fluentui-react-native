import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { getFluentUIApplePalette } from './fluentAppleColors.macos';
import { getAppleSemanticPalette } from './applePlatformColors.macos';

/** creates a palette of colors for the apple theme, given the FluentUI Apple Palette and Apple Semantic Palette */
export function fallbackApplePalette(): ThemeColorDefinition {
  const fluentUIApple = getFluentUIApplePalette();
  const applePlatform = getAppleSemanticPalette();

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

    // Set the fallback default button palette to communicationBlue,
    // and use communicationBlueShade20 to emulate the NSColor pressed system effect
    buttonBackgroundChecked: fluentUIApple.communicationBlueShade20,
    buttonBackgroundHovered: fluentUIApple.communicationBlue,
    buttonBackgroundCheckedHovered: fluentUIApple.communicationBlueShade20,
    buttonBackgroundPressed: fluentUIApple.communicationBlueShade20,
    buttonBackgroundDisabled: fluentUIApple.brandBackgroundDisabled,
    buttonText: fluentUIApple.neutralInverted,
    buttonTextHovered: fluentUIApple.neutralInverted,
    buttonTextChecked: fluentUIApple.neutralInverted,
    buttonTextCheckedHovered: fluentUIApple.neutralInverted,
    buttonTextPressed: fluentUIApple.neutralInverted,
    buttonTextDisabled: fluentUIApple.brandForegroundDisabled,
    buttonBorderDisabled: 'transparent',
    buttonBorderFocused: 'transparent',

    primaryButtonBackground: fluentUIApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentUIApple.communicationBlue,
    primaryButtonBackgroundPressed: fluentUIApple.communicationBlueShade20,
    primaryButtonBackgroundDisabled: fluentUIApple.brandBackgroundDisabled,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: fluentUIApple.neutralInverted,
    primaryButtonTextHovered: fluentUIApple.neutralInverted,
    primaryButtonTextPressed: fluentUIApple.neutralInverted,
    primaryButtonTextDisabled: fluentUIApple.brandForegroundDisabled,

    accentButtonBackground: fluentUIApple.communicationBlue,
    accentButtonText: fluentUIApple.neutralInverted,

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

    buttonBackground: fluentUIApple.communicationBlue,
    buttonBorder: 'transparent',
    buttonContent: fluentUIApple.neutralInverted,
    buttonIcon: fluentUIApple.neutralInverted,

    buttonHoveredBackground: fluentUIApple.communicationBlue,
    buttonHoveredBorder: 'transparent',
    buttonHoveredContent: fluentUIApple.neutralInverted,
    buttonHoveredIcon: fluentUIApple.neutralInverted,

    buttonFocusedBackground: fluentUIApple.communicationBlue,
    buttonFocusedBorder: 'transparent',
    buttonFocusedContent: fluentUIApple.neutralInverted,
    buttonFocusedIcon: fluentUIApple.neutralInverted,

    buttonPressedBackground: fluentUIApple.communicationBlueShade20,
    buttonPressedBorder: 'transparent',
    buttonPressedContent: fluentUIApple.neutralInverted,
    buttonPressedIcon: fluentUIApple.neutralInverted,

    buttonDisabledBackground: fluentUIApple.brandBackgroundDisabled,
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: fluentUIApple.brandForegroundDisabled,
    buttonDisabledIcon: fluentUIApple.brandForegroundDisabled,

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: fluentUIApple.communicationBlue,
    ghostIcon: fluentUIApple.communicationBlue,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: fluentUIApple.communicationBlue,
    ghostHoveredIcon: fluentUIApple.communicationBlue,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: fluentUIApple.communicationBlue,
    ghostFocusedIcon: fluentUIApple.communicationBlue,

    ghostPressedBackground: 'transparent',
    ghostPressedBorder: 'transparent',
    ghostPressedContent: fluentUIApple.communicationBlueShade30,
    ghostPressedIcon: fluentUIApple.communicationBlueShade30,

    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: fluentUIApple.brandForegroundDisabled,
    ghostDisabledIcon: fluentUIApple.brandForegroundDisabled,

    brandBackground: fluentUIApple.communicationBlue,
    brandBorder: 'transparent',
    brandContent: fluentUIApple.neutralInverted,
    brandIcon: fluentUIApple.neutralInverted,

    brandHoveredBackground: fluentUIApple.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: fluentUIApple.neutralInverted,
    brandHoveredIcon: fluentUIApple.neutralInverted,

    brandFocusedBackground: fluentUIApple.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: fluentUIApple.neutralInverted,
    brandFocusedIcon: fluentUIApple.neutralInverted,

    brandPressedBackground: fluentUIApple.communicationBlueShade20,
    brandPressedBorder: 'transparent',
    brandPressedContent: fluentUIApple.neutralInverted,
    brandPressedIcon: fluentUIApple.neutralInverted,

    brandDisabledBackground: fluentUIApple.brandBackgroundDisabled,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: fluentUIApple.brandForegroundDisabled,
    brandDisabledIcon: fluentUIApple.brandForegroundDisabled,

    buttonCheckedBackground: fluentUIApple.communicationBlueShade20,
    buttonCheckedContent: fluentUIApple.neutralInverted,
    buttonCheckedHoveredBackground: fluentUIApple.communicationBlueShade20,
    buttonCheckedHoveredContent: fluentUIApple.neutralInverted,

    brandCheckedBackground: fluentUIApple.communicationBlueShade20,
    brandCheckedContent: fluentUIApple.neutralInverted,
    brandCheckedHoveredBackground: fluentUIApple.communicationBlueShade20,
    brandCheckedHoveredContent: fluentUIApple.neutralInverted,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: fluentUIApple.communicationBlueShade30,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: fluentUIApple.communicationBlueShade30,
    ghostCheckedHoveredBorder: 'transparent',

    ghostSecondaryContent: fluentUIApple.communicationBlue,
    ghostFocusedSecondaryContent: fluentUIApple.communicationBlue,
    ghostHoveredSecondaryContent: fluentUIApple.communicationBlue,
    ghostPressedSecondaryContent: fluentUIApple.communicationBlue,

    brandSecondaryContent: fluentUIApple.neutralInverted,
    brandFocusedSecondaryContent: fluentUIApple.neutralInverted,
    brandHoveredSecondaryContent: fluentUIApple.neutralInverted,
    brandPressedSecondaryContent: fluentUIApple.neutralInverted,

    buttonDisabledSecondaryContent: fluentUIApple.brandForegroundDisabled,
    buttonHoveredSecondaryContent: fluentUIApple.neutralInverted,
    buttonPressedSecondaryContent: fluentUIApple.neutralInverted,
  };
}
