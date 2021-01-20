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
    // bodyStandoutBackground: p.gray40,
    // bodyFrameBackground: p.blue10,
    // bodyFrameDivider: p.blue10,
    bodyText: as.textColor,
    // bodyTextChecked: p.blue10,
    // subText: p.blue10,
    // bodyDivider: p.blue10,

    // disabledBackground: p.blue10,
    // disabledText: p.blue10,
    // disabledBodyText: p.blue10,
    // disabledSubtext: p.blue10,
    // disabledBodySubtext: p.blue10,

    focusBorder: as.keyboardFocusIndicatorColor,
    // variantBorder: p.blue10,
    // variantBorderHovered: p.blue10,
    // defaultStateBackground: p.blue10,

    // errorText: p.warningPrimary,
    // warningText: p.warningPrimary,
    // errorBackground: p.blue10,
    // blockingBackground: p.blue10,
    // warningBackground: p.blue10,
    // warningHighlight: p.blue10,
    // successBackground: p.blue10,

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

    primaryButtonBackground: as.controlBackgroundColor,
    primaryButtonBackgroundHovered: as.controlBackgroundColor,
    // primaryButtonBackgroundPressed: p.blue10,
    // primaryButtonBackgroundDisabled: p.blue10,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: as.controlTextColor,
    primaryButtonTextHovered: as.controlTextColor,
    // primaryButtonTextPressed: p.blue10,
    primaryButtonTextDisabled: as.disabledControlTextColor,

    // accentButtonBackground: p.blue10,
    // accentButtonText: p.blue10,

    //TODO Differentiate Menu and List
    menuBackground: as.textBackgroundColor,
    menuDivider: as.separatorColor,
    menuIcon: as.textColor,
    menuHeader: as.headerTextColor,
    menuItemBackgroundHovered: as.controlBackgroundColor,
    // menuItemBackgroundPressed: p.blue10,
    menuItemText: as.selectedMenuItemTextColor,
    menuItemTextHovered: as.selectedMenuItemTextColor,

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
    buttonHoveredBorder: as.controlTextColor,
    buttonHoveredContent: 'transparent',
    buttonHoveredIcon: as.controlTextColor,

    // TODO what does focus even mean on macOS?
    buttonFocusedBackground: as.controlBackgroundColor,
    buttonFocusedBorder: as.controlTextColor,
    buttonFocusedContent: 'transparent',
    buttonFocusedIcon: as.controlTextColor,

    // TODO Native Module for withSystemEffect(.pressed)
    // buttonPressedBackground: p.blue10,
    // buttonPressedBorder: p.blue10,
    // buttonPressedContent: p.blue10,
    // buttonPressedIcon: p.blue10,

    // TODO Native Module for withSystemEffect(.disabled)
    // buttonDisabledBackground: p.blue10,
    // buttonDisabledBorder: p.blue10,
    // buttonDisabledContent: p.blue10,
    // buttonDisabledIcon: p.blue10,

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
    ghostPressedBackground: p.communicationBlue,
    // ghostPressedBorder: p.blue10,
    // ghostPressedContent: p.blue10,
    // ghostPressedIcon: p.blue10,

    // TODO Native Module for withSystemEffect(.disabled)
    // ghostDisabledBackground: p.blue10,
    // ghostDisabledBorder: p.blue10,
    // ghostDisabledContent: p.blue10,
    // ghostDisabledIcon: p.blue10,

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

    brandPressedBackground: p.communicationBlue,
    brandPressedBorder: as.controlTextColor,
    brandPressedContent: p.blue10,
    brandPressedIcon: as.controlTextColor,

    // TODO System Effect
    // brandDisabledBackground: p.blue10,
    // brandDisabledBorder: p.blue10,
    // brandDisabledContent: p.blue10,
    // brandDisabledIcon: p.blue10,

    // TODO What is checked?
    // buttonCheckedBackground: p.blue10,
    // buttonCheckedContent: p.blue10,
    // buttonCheckedHoveredBackground: p.blue10,
    // buttonCheckedHoveredContent: p.blue10,

    // brandCheckedBackground: p.blue10,
    // brandCheckedContent: p.blue10,
    // brandCheckedHoveredBackground: p.blue10,
    // brandCheckedHoveredContent: p.blue10,

    // ghostCheckedBackground: p.blue10,
    // ghostCheckedContent: p.blue10,
    // ghostCheckedHoveredBackground: p.blue10,
    // ghostCheckedHoveredContent: p.blue10,
    // ghostCheckedHoveredBorder: p.blue10,

    // TODO What to do with secondary?
    // ghostSecondaryContent: p.blue10,
    // ghostFocusedSecondaryContent: p.blue10,
    // ghostHoveredSecondaryContent: p.blue10,
    // ghostPressedSecondaryContent: p.blue10,

    // brandSecondaryContent: p.blue10,
    // brandFocusedSecondaryContent: p.blue10,
    // brandHoveredSecondaryContent: p.blue10,
    // brandPressedSecondaryContent: p.blue10,

    // buttonDisabledSecondaryContent: p.blue10,
    // buttonHoveredSecondaryContent: p.blue10,
    // buttonPressedSecondaryContent: p.blue10,
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
