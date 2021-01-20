import {
  FontSize,
  FontSizes,
  FontWeightValue,
  PartialPalette,
  PartialTheme,
  Spacing,
  Typography,
  Variants,
} from '@fluentui-react-native/theme-types';
import { ApplePalette, getStockAppleLightPalette, getStockAppleDarkPalette } from './fluentAppleColors';
import { AppleSemanticPalette, getAppleSemanticLightPalette, getAppleSemanticDarkPalette } from './appleSemanticColors';

// Instantiates the Palette with colors from FluentUI Apple and the platform semantic colors
export function paletteFromAppleColors(p: ApplePalette, as: AppleSemanticPalette): PartialPalette {
  return {
    background: as.windowBackgroundColor,
    bodyStandoutBackground: as.underPageBackgroundColor,
    bodyFrameBackground: as.windowBackgroundColor,
    bodyFrameDivider: as.separatorColor,
    bodyText: as.textColor,
    bodyTextChecked: as.selectedTextColor,
    subText: as.placeholderTextColor,
    bodyDivider: as.separatorColor,

    // TODO
    disabledBackground: p.blue10,
    disabledText: p.blue10,
    disabledBodyText: p.blue10,
    disabledSubtext: p.blue10,
    disabledBodySubtext: p.blue10,

    focusBorder: as.keyboardFocusIndicatorColor,
    variantBorder: as.separatorColor,
    variantBorderHovered: as.separatorColor,
    defaultStateBackground: as.controlBackgroundColor,

    // TODO
    errorText: p.warningPrimary,
    warningText: p.warningPrimary,
    errorBackground: p.warningPrimary,
    blockingBackground: p.warningPrimary,
    warningBackground: p.warningPrimary,
    warningHighlight: p.warningPrimary,
    successBackground: p.warningPrimary,

    inputBorder: as.separatorColor,
    inputBorderHovered: as.separatorColor,
    inputBackground: as.textBackgroundColor,
    // inputBackgroundChecked: p.blue10,
    // inputBackgroundCheckedHovered: p.blue10,
    // inputForegroundChecked: p.blue10,
    inputFocusBorderAlt: as.keyboardFocusIndicatorColor,
    // smallInputBorder: p.blue10,
    // inputText: p.blue10,
    // inputTextHovered: p.blue10,
    // inputPlaceholderText: p.blue10,

    // buttonBackgroundChecked: p.blue10,
    // buttonBackgroundHovered: p.blue10,
    // buttonBackgroundCheckedHovered: p.blue10,
    // buttonBackgroundPressed: p.blue10,
    // buttonBackgroundDisabled: p.blue10,
    // buttonText: as.textColor,
    // buttonTextHovered: p.blue10,
    // buttonTextChecked: p.blue10,
    // buttonTextCheckedHovered: p.blue10,
    // buttonTextPressed: p.blue10,
    // buttonTextDisabled: p.blue10,
    // buttonBorderDisabled: p.blue10,
    // buttonBorderFocused: p.blue10,

    primaryButtonBackground: p.communicationBlue,
    primaryButtonBackgroundHovered: p.communicationBlue,
    primaryButtonBackgroundPressed: p.communicationBlueTint10,
    primaryButtonBackgroundDisabled: p.gray100,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: as.controlTextColor,
    primaryButtonTextHovered: as.controlTextColor,
    primaryButtonTextPressed: as.controlTextColor,
    primaryButtonTextDisabled: as.disabledControlTextColor,

    // accentButtonBackground: p.blue10,
    // accentButtonText: p.blue10,

    //TODO Differentiate Menu and List
    menuBackground: as.alternatingContentBackgroundColor,
    menuDivider: as.separatorColor,
    menuIcon: as.textColor,
    menuHeader: as.headerTextColor,
    menuItemBackgroundHovered: as.controlBackgroundColor,
    menuItemBackgroundPressed: as.selectedContentBackgroundColor,
    menuItemText: as.textColor,
    menuItemTextHovered: as.textColor,

    listBackground: as.textBackgroundColor,
    listText: as.textColor,
    listItemBackgroundHovered: as.textBackgroundColor,
    // listItemBackgroundChecked: p.blue10,
    // listItemBackgroundCheckedHovered: p.blue10,

    // listHeaderBackgroundHovered: p.blue10,
    // listHeaderBackgroundPressed: p.blue10,

    // TODO ActionLink vs Link?
    actionLink: as.linkColor,
    actionLinkHovered: as.linkColor,
    link: as.linkColor,
    linkHovered: as.linkColor,
    // linkPressed: p.blue10,

    /* Control Color Tokens */

    // Default values without any style
    buttonBackground: as.controlBackgroundColor,
    buttonBorder: 'transparent',
    buttonContent: as.controlTextColor,
    buttonIcon: as.controlTextColor,

    // macOS Button has no hover effect
    buttonHoveredBackground: as.controlBackgroundColor,
    buttonHoveredBorder: 'transparent',
    buttonHoveredContent: as.controlTextColor,
    buttonHoveredIcon: as.controlTextColor,

    // TODO what does focus even mean on macOS?
    buttonFocusedBackground: as.controlBackgroundColor,
    buttonFocusedBorder: 'transparent',
    buttonFocusedContent: as.controlTextColor,
    buttonFocusedIcon: as.controlTextColor,

    // TODO Native Module for withSystemEffect(.pressed)
    buttonPressedBackground: p.communicationBlueTint10,
    buttonPressedBorder: 'transparent',
    buttonPressedContent: as.controlTextColor,
    buttonPressedIcon: as.controlTextColor,

    // TODO Native Module for withSystemEffect(.disabled)
    buttonDisabledBackground: p.gray100,
    buttonDisabledBorder: 'transparent',
    buttonDisabledContent: as.controlTextColor,
    buttonDisabledIcon: as.controlTextColor,

    ghostBackground: 'transparent',
    ghostBorder: 'transparent',
    ghostContent: as.controlTextColor,
    ghostIcon: as.controlTextColor,

    ghostHoveredBackground: 'transparent',
    ghostHoveredBorder: 'transparent',
    ghostHoveredContent: as.controlTextColor,
    ghostHoveredIcon: as.controlTextColor,

    ghostFocusedBackground: 'transparent',
    ghostFocusedBorder: 'transparent',
    ghostFocusedContent: as.controlTextColor,
    ghostFocusedIcon: as.controlTextColor,

    // TODO System Effect(.pressed)
    ghostPressedBackground: 'transparent',
    ghostPressedBorder: 'transparent',
    ghostPressedContent: p.communicationBlueTint20,
    ghostPressedIcon: p.communicationBlueTint20,

    // TODO Native Module for withSystemEffect(.disabled)
    ghostDisabledBackground: 'transparent',
    ghostDisabledBorder: 'transparent',
    ghostDisabledContent: p.communicationBlueTint20,
    ghostDisabledIcon: p.communicationBlueTint20,

    brandBackground: p.communicationBlue,
    brandBorder: 'transparent',
    brandContent: as.controlTextColor,
    brandIcon: as.controlTextColor,

    brandHoveredBackground: p.communicationBlue,
    brandHoveredBorder: 'transparent',
    brandHoveredContent: as.controlTextColor,
    brandHoveredIcon: as.controlTextColor,

    brandFocusedBackground: p.communicationBlue,
    brandFocusedBorder: 'transparent',
    brandFocusedContent: as.controlTextColor,
    brandFocusedIcon: as.controlTextColor,

    brandPressedBackground: p.communicationBlueTint10,
    brandPressedBorder: 'transparent',
    brandPressedContent: as.controlTextColor,
    brandPressedIcon: as.controlTextColor,

    // TODO System Effect
    brandDisabledBackground: p.gray100,
    brandDisabledBorder: 'transparent',
    brandDisabledContent: as.controlTextColor,
    brandDisabledIcon: as.controlTextColor,

    // TODO What is checked?
    buttonCheckedBackground: as.selectedContentBackgroundColor,
    buttonCheckedContent: as.controlTextColor,
    buttonCheckedHoveredBackground: as.selectedContentBackgroundColor,
    buttonCheckedHoveredContent: as.controlTextColor,

    brandCheckedBackground: p.communicationBlueTint10,
    brandCheckedContent: as.controlTextColor,
    brandCheckedHoveredBackground: p.communicationBlueTint10,
    brandCheckedHoveredContent: as.controlTextColor,

    ghostCheckedBackground: 'transparent',
    ghostCheckedContent: p.communicationBlueTint20,
    ghostCheckedHoveredBackground: 'transparent',
    ghostCheckedHoveredContent: p.communicationBlueTint20,
    ghostCheckedHoveredBorder: 'transparent',

    // TODO What to do with secondary?
    ghostSecondaryContent: as.secondaryLabelColor,
    ghostFocusedSecondaryContent: as.secondaryLabelColor,
    ghostHoveredSecondaryContent: as.secondaryLabelColor,
    ghostPressedSecondaryContent: as.secondaryLabelColor,

    brandSecondaryContent: as.secondaryLabelColor,
    brandFocusedSecondaryContent: as.secondaryLabelColor,
    brandHoveredSecondaryContent: as.secondaryLabelColor,
    brandPressedSecondaryContent: as.secondaryLabelColor,

    buttonDisabledSecondaryContent: as.tertiaryLabelColor,
    buttonHoveredSecondaryContent: as.tertiaryLabelColor,
    buttonPressedSecondaryContent: as.tertiaryLabelColor,
  };
}

function _appleTypography(): Typography {
  const appleDict = {
    sizes: {
      caption: 10 as FontSize,
      secondary: 11 as FontSize, // Callout
      body: 13 as FontSize, // Body
      subheader: 16 as FontSize, // Subheadline
      header: 20 as FontSize, // Headline
      hero: 22 as FontSize, ///Title 1
      heroLarge: 26 as FontSize, //Large Title,
    } as FontSizes,
    weights: {
      // ultralight: '100'
      // this: '200'
      // semibold: ???
      regular: '400' as FontWeightValue,
      semiBold: '600' as FontWeightValue,
      Bold: '800' as FontWeightValue,
    },
    families: {
      primary: 'System',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      sansSerif: 'System',
      serif: 'System',
    },
    variants: {
      captionStandard: { face: 'primary', size: 'caption', weight: 'regular' },
      secondaryStandard: { face: 'primary', size: 'secondary', weight: 'regular' },
      secondarySemibold: { face: 'primary', size: 'secondary', weight: 'semiBold' },
      bodyStandard: { face: 'primary', size: 'body', weight: 'regular' },
      bodySemibold: { face: 'primary', size: 'body', weight: 'semiBold' },
      subheaderStandard: { face: 'primary', size: 'subheader', weight: 'regular' },
      subheaderSemibold: { face: 'primary', size: 'subheader', weight: 'semiBold' },
      headerStandard: { face: 'primary', size: 'header', weight: 'regular' },
      headerSemibold: { face: 'primary', size: 'header', weight: 'semiBold' },
      heroStandard: { face: 'primary', size: 'hero', weight: 'regular' },
      heroSemibold: { face: 'primary', size: 'hero', weight: 'semiBold' },
      heroLargeStandard: { face: 'primary', size: 'heroLarge', weight: 'regular' },
      heroLargeSemibold: { face: 'primary', size: 'heroLarge', weight: 'semiBold' },
    } as Variants,
  };

  return appleDict;
}

export function appleSpacing(): Spacing {
  return { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' };
}

export const appleComponents = {
  Button: {
    tokens: {
      borderRadius: 5,
      borderWidth: 1,
      minHeight: 28,
      minWidth: 72,
    },
  },
};

export const defaultAppleTheme: PartialTheme = {
  colors: paletteFromAppleColors(getStockAppleLightPalette(), getAppleSemanticLightPalette()),
  typography: _appleTypography(),
  spacing: appleSpacing(),
  components: appleComponents,
  host: { appearance: 'light' },
};

export const defaultAppleDarkTheme: PartialTheme = {
  colors: paletteFromAppleColors(getStockAppleDarkPalette(), getAppleSemanticDarkPalette()),
  typography: defaultAppleTheme.typography,
  spacing: defaultAppleTheme.spacing,
  components: defaultAppleTheme.components,
  host: { appearance: 'dark' },
};
