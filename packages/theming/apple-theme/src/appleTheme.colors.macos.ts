import { ThemeColorDefinition, ColorValue } from '@fluentui-react-native/theme-types';
import { getFluentUIApplePalette } from './fluentAppleColors.macos';
import { getAppleSemanticPalette } from './applePlatformColors.macos';
import { NativeModules, processColor } from 'react-native';

const { MSFAppleThemeModule } = NativeModules;

function colorWithEffect(color: ColorValue, effect: string): ColorValue {
  MSFAppleThemeModule.colorWithEffect(
    processColor(color),
    effect,
    (error) => {
      console.error(`Error found! ${error}`);
    },
    (colorWithAppliedEffect: ColorValue) => {
      console.log('color with applied effect: ' + colorWithAppliedEffect);
      return colorWithAppliedEffect;
    },
  );
  console.log('Do we ever get here?');
}

/** creates a palette of colors for the apple theme, given the FluentUI Apple Palette and Apple Semantic Palette */
export function paletteFromAppleColors(): ThemeColorDefinition {
  const fluentUIApple = getFluentUIApplePalette();
  const applePlatform = getAppleSemanticPalette();

  // const pressedBlue: ColorValue = colorWithEffect('blue', 'pressed');
  // await MSFAppleThemeModule.nothing();
  // console.warn('Pressed Blue: ' + pressedBlue);

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

    buttonBackgroundChecked: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    buttonBackgroundHovered: fluentUIApple.communicationBlue,
    buttonBackgroundCheckedHovered: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    buttonBackgroundPressed: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    buttonBackgroundDisabled: colorWithEffect(fluentUIApple.communicationBlue, 'disabled'),
    buttonText: fluentUIApple.neutralInverted,
    buttonTextHovered: fluentUIApple.neutralInverted,
    buttonTextChecked: colorWithEffect(fluentUIApple.neutralInverted, 'pressed'),
    buttonTextCheckedHovered: colorWithEffect(fluentUIApple.neutralInverted, 'pressed'),
    buttonTextPressed: colorWithEffect(fluentUIApple.neutralInverted, 'pressed'),
    buttonTextDisabled: colorWithEffect(fluentUIApple.neutralInverted, 'disabled'),
    buttonBorderDisabled: 'transparent',
    buttonBorderFocused: 'transparent',

    primaryButtonBackground: fluentUIApple.communicationBlue,
    primaryButtonBackgroundHovered: fluentUIApple.communicationBlue,
    primaryButtonBackgroundPressed: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    primaryButtonBackgroundDisabled: colorWithEffect(fluentUIApple.communicationBlue, 'disabled'),
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: fluentUIApple.neutralInverted,
    primaryButtonTextHovered: fluentUIApple.neutralInverted,
    primaryButtonTextPressed: colorWithEffect(fluentUIApple.neutralInverted, 'pressed'),
    primaryButtonTextDisabled: colorWithEffect(fluentUIApple.neutralInverted, 'disabled'),

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

    buttonBackground: fluentUIApple.communicationBlue,
    buttonBorder: 'transparent',
    buttonContent: fluentUIApple.neutralInverted,
    buttonIcon: fluentUIApple.neutralInverted,

    buttonHoveredBackground: fluentUIApple.communicationBlue,
    buttonHoveredBorder: 'transparent',
    buttonHoveredContent: applePlatform.controlTextColor,
    buttonHoveredIcon: applePlatform.controlTextColor,

    buttonFocusedBackground: fluentUIApple.communicationBlue,
    buttonFocusedBorder: 'transparent',
    buttonFocusedContent: applePlatform.controlTextColor,
    buttonFocusedIcon: applePlatform.controlTextColor,

    buttonPressedBackground: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    buttonPressedBorder: 'transparent',
    buttonPressedContent: applePlatform.selectedControlTextColor,
    buttonPressedIcon: applePlatform.selectedControlTextColor,

    buttonDisabledBackground: colorWithEffect(fluentUIApple.communicationBlue, 'disabled'),
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
    ghostPressedContent: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    ghostPressedIcon: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),

    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: colorWithEffect(fluentUIApple.communicationBlue, 'disabled'),
    ghostDisabledIcon: colorWithEffect(fluentUIApple.communicationBlue, 'disabled'),

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

    brandPressedBackground: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    brandPressedBorder: 'transparent',
    brandPressedContent: applePlatform.controlTextColor,
    brandPressedIcon: applePlatform.controlTextColor,

    brandDisabledBackground: colorWithEffect(fluentUIApple.communicationBlue, 'disabled'),
    brandDisabledBorder: 'transparent',
    brandDisabledContent: applePlatform.disabledControlTextColor,
    brandDisabledIcon: applePlatform.disabledControlTextColor,

    buttonCheckedBackground: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    buttonCheckedContent: applePlatform.controlTextColor,
    buttonCheckedHoveredBackground: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    buttonCheckedHoveredContent: applePlatform.controlTextColor,

    brandCheckedBackground: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    brandCheckedContent: applePlatform.controlTextColor,
    brandCheckedHoveredBackground: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    brandCheckedHoveredContent: applePlatform.controlTextColor,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: colorWithEffect(fluentUIApple.communicationBlue, 'pressed'),
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
