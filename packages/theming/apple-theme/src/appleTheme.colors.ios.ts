import { ThemeColorDefinition } from '@fluentui-react-native/theme-types';
import { ApplePalette } from './fluentAppleColors.ios';
import { AppleSemanticPalette } from './appleSemanticColors.ios';

/** creates a palette of colors for the apple theme, given the FluentUI Apple Palette and Apple Semantic Palette */
export function paletteFromAppleColors(fluentApple: ApplePalette, appleSemantic: AppleSemanticPalette): ThemeColorDefinition {
  return {
    /* PaletteBackgroundColors & PaletteTextColors */

    background: appleSemantic.systemBackground,
    bodyStandoutBackground: appleSemantic.secondarySystemBackground,
    bodyFrameBackground: appleSemantic.systemBackground,
    bodyFrameDivider: appleSemantic.opaqueSeparator,
    bodyText: appleSemantic.label,
    bodyTextChecked: appleSemantic.label,
    subText: appleSemantic.secondaryLabel,
    bodyDivider: appleSemantic.separator,

    // TODO
    disabledBackground: fluentApple.gray100,
    disabledText: appleSemantic.tertiaryLabel,
    disabledBodyText: appleSemantic.quaternaryLabel,
    disabledSubtext: appleSemantic.tertiaryLabel,
    disabledBodySubtext: appleSemantic.quaternaryLabel,

    focusBorder: 'transparent',
    variantBorder: appleSemantic.separator,
    variantBorderHovered: appleSemantic.separator,
    defaultStateBackground: appleSemantic.systemFill,

    // TODO
    errorText: fluentApple.dangerPrimary,
    warningText: fluentApple.warningPrimary,
    errorBackground: fluentApple.dangerTint10,
    blockingBackground: fluentApple.dangerTint10,
    warningBackground: fluentApple.warningPrimary,
    warningHighlight: fluentApple.warningTint10,
    successBackground: fluentApple.successTint10,

    inputBorder: appleSemantic.separator,
    inputBorderHovered: appleSemantic.separator,
    inputBackground: appleSemantic.quaternarySystemFill,
    inputBackgroundChecked: appleSemantic.secondarySystemFill,
    inputBackgroundCheckedHovered: appleSemantic.secondarySystemFill,
    inputForegroundChecked: fluentApple.communicationBlue,
    inputFocusBorderAlt: appleSemantic.opaqueSeparator,
    smallInputBorder: appleSemantic.separator,
    inputText: appleSemantic.label,
    inputTextHovered: appleSemantic.label,
    inputPlaceholderText: appleSemantic.placeholderText,

    buttonBackgroundChecked: fluentApple.communicationBlueTint10,
    buttonBackgroundHovered: fluentApple.communicationBlue,
    buttonBackgroundCheckedHovered: fluentApple.communicationBlueTint10,
    buttonBackgroundPressed: fluentApple.communicationBlueTint10,
    buttonBackgroundDisabled: fluentApple.gray100,
    buttonText: appleSemantic.label,
    buttonTextHovered: appleSemantic.label,
    buttonTextChecked: appleSemantic.label,
    buttonTextCheckedHovered: appleSemantic.label,
    buttonTextPressed: appleSemantic.label,
    buttonTextDisabled: appleSemantic.label,
    buttonBorderDisabled: 'transparent',
    buttonBorderFocused: 'transparent',

    primaryButtonBackground: fluentApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentApple.communicationBlue,
    primaryButtonBackgroundPressed: fluentApple.communicationBlueTint10,
    primaryButtonBackgroundDisabled: fluentApple.gray100,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: appleSemantic.label,
    primaryButtonTextHovered: appleSemantic.label,
    primaryButtonTextPressed: appleSemantic.label,
    primaryButtonTextDisabled: appleSemantic.secondaryLabel,

    accentButtonBackground: fluentApple.communicationBlueTint10,
    accentButtonText: appleSemantic.label,

    //TODO Differentiate Menu and List?
    menuBackground: appleSemantic.systemGroupedBackground,
    menuDivider: appleSemantic.separator,
    menuIcon: appleSemantic.label,
    menuHeader: appleSemantic.label,
    menuItemBackgroundHovered: appleSemantic.systemGroupedBackground,
    menuItemBackgroundPressed: appleSemantic.secondarySystemGroupedBackground,
    menuItemText: appleSemantic.label,
    menuItemTextHovered: appleSemantic.label,

    listBackground: appleSemantic.systemGroupedBackground,
    listText: appleSemantic.label,
    listItemBackgroundHovered: appleSemantic.systemGroupedBackground,
    listItemBackgroundChecked: appleSemantic.secondarySystemGroupedBackground,
    listItemBackgroundCheckedHovered: appleSemantic.secondarySystemGroupedBackground,

    listHeaderBackgroundHovered: appleSemantic.label,
    listHeaderBackgroundPressed: appleSemantic.label,

    // TODO ActionLink vs Link?
    actionLink: appleSemantic.link,
    actionLinkHovered: appleSemantic.link,
    link: appleSemantic.link,
    linkHovered: appleSemantic.link,
    linkPressed: appleSemantic.link,

    /* ControlColorTokens */

    // Default values without any style
    buttonBackground: fluentApple.communicationBlue,
    buttonBorder: 'transparent',
    buttonContent: appleSemantic.label,
    buttonIcon: appleSemantic.label,

    // macOS Button has no hover effect
    buttonHoveredBackground: fluentApple.communicationBlue,
    buttonHoveredBorder: 'transparent',
    buttonHoveredContent: appleSemantic.label,
    buttonHoveredIcon: appleSemantic.label,

    // TODO what does focus even mean on macOS?
    buttonFocusedBackground: fluentApple.communicationBlue,
    buttonFocusedBorder: 'transparent',
    buttonFocusedContent: appleSemantic.label,
    buttonFocusedIcon: appleSemantic.label,

    // TODO Native Module for withSystemEffect(.pressed)
    buttonPressedBackground: fluentApple.communicationBlueTint10,
    buttonPressedBorder: 'transparent',
    buttonPressedContent: appleSemantic.label,
    buttonPressedIcon: appleSemantic.label,

    // TODO Native Module for withSystemEffect(.disabled)
    buttonDisabledBackground: fluentApple.gray100,
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: appleSemantic.label,
    buttonDisabledIcon: appleSemantic.label,

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: appleSemantic.label,
    ghostIcon: appleSemantic.label,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: appleSemantic.label,
    ghostHoveredIcon: appleSemantic.label,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: appleSemantic.label,
    ghostFocusedIcon: appleSemantic.label,

    // TODO System Effect(.pressed)
    ghostPressedBackground: 'transparent',
    ghostPressedBorder: 'transparent',
    ghostPressedContent: fluentApple.communicationBlueTint20,
    ghostPressedIcon: fluentApple.communicationBlueTint20,

    // TODO Native Module for withSystemEffect(.disabled)
    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: fluentApple.communicationBlueTint20,
    ghostDisabledIcon: fluentApple.communicationBlueTint20,

    brandBackground: fluentApple.communicationBlue,
    brandBorder: 'transparent',
    brandContent: appleSemantic.label,
    brandIcon: appleSemantic.label,

    brandHoveredBackground: fluentApple.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: appleSemantic.label,
    brandHoveredIcon: appleSemantic.label,

    brandFocusedBackground: fluentApple.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: appleSemantic.label,
    brandFocusedIcon: appleSemantic.label,

    brandPressedBackground: fluentApple.communicationBlueTint10,
    brandPressedBorder: 'transparent',
    brandPressedContent: appleSemantic.label,
    brandPressedIcon: appleSemantic.label,

    // TODO System Effect
    brandDisabledBackground: fluentApple.gray100,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: appleSemantic.label,
    brandDisabledIcon: appleSemantic.label,

    // TODO What is checked?
    buttonCheckedBackground: appleSemantic.systemFill,
    buttonCheckedContent: appleSemantic.label,
    buttonCheckedHoveredBackground: appleSemantic.systemFill,
    buttonCheckedHoveredContent: appleSemantic.label,

    brandCheckedBackground: fluentApple.communicationBlueTint10,
    brandCheckedContent: appleSemantic.label,
    brandCheckedHoveredBackground: fluentApple.communicationBlueTint10,
    brandCheckedHoveredContent: appleSemantic.label,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: fluentApple.communicationBlueTint20,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: fluentApple.communicationBlueTint20,
    ghostCheckedHoveredBorder: 'transparent',

    // TODO What to do with secondary?
    ghostSecondaryContent: appleSemantic.secondaryLabel,
    ghostFocusedSecondaryContent: appleSemantic.secondaryLabel,
    ghostHoveredSecondaryContent: appleSemantic.secondaryLabel,
    ghostPressedSecondaryContent: appleSemantic.secondaryLabel,

    brandSecondaryContent: appleSemantic.secondaryLabel,
    brandFocusedSecondaryContent: appleSemantic.secondaryLabel,
    brandHoveredSecondaryContent: appleSemantic.secondaryLabel,
    brandPressedSecondaryContent: appleSemantic.secondaryLabel,

    buttonDisabledSecondaryContent: appleSemantic.tertiaryLabel,
    buttonHoveredSecondaryContent: appleSemantic.tertiaryLabel,
    buttonPressedSecondaryContent: appleSemantic.tertiaryLabel,
  };
}
