import type { Theme } from '@fluentui-react-native/theme-types';

const black = 'black';
const neutralDark = '#201f1e';
const neutralPrimary = '#323130';
const neutralPrimaryAlt = '#3b3a39';
const neutralSecondary = '#605e5c';
const neutralSecondaryAlt = '#8a8886';
const neutralTertiary = '#a19f9d';
const neutralTertiaryAlt = '#c8c6c4';
const neutralQuaternary = '#d2d0ce';
const neutralQuaternaryAlt = '#e1dfdd';
const neutralLight = '#edebe9';
const neutralLighter = '#f3f2f1';
const neutralLighterAlt = '#faf9f8';
const white = '#ffffff';
// Shared Colors
const red = '#d13438';
const redDark = '#a4262c';
const themeDarker = '#004578';
const themeDark = '#005a9e';
const themeDarkAlt = '#106ebe';
const themePrimary = '#0078d4';
const themeSecondary = '#2b88d8';
const themeTertiary = '#71afe5';
const themeLight = '#c7e0f4';
const themeLighter = '#deecf9';
const themeLighterAlt = '#eff6fc';
const accent = '#0078d4';
const blackTranslucent40 = 'rgba(0,0,0,.4)';

export const mockTheme: Theme = {
  colors: {
    black,
    neutralDark,
    neutralPrimary,
    neutralPrimaryAlt,
    neutralSecondary,
    neutralSecondaryAlt,
    neutralTertiary,
    neutralTertiaryAlt,
    neutralQuaternary,
    neutralQuaternaryAlt,
    neutralLight,
    neutralLighter,
    neutralLighterAlt,
    white,
    // Shared Colors
    red,
    redDark,
    themeDarker,
    themeDark,
    themeDarkAlt,
    themePrimary,
    themeSecondary,
    themeTertiary,
    themeLight,
    themeLighter,
    themeLighterAlt,
    accent,
    blackTranslucent40,

    // palette colors
    background: white,
    bodyStandoutBackground: neutralLighterAlt,
    bodyFrameBackground: white,
    bodyFrameDivider: neutralLight,
    bodyText: neutralPrimary,
    bodyTextChecked: black,
    subText: neutralSecondary,
    bodyDivider: neutralLight,

    disabledBackground: neutralLighter,
    disabledText: neutralTertiary,
    disabledBodyText: neutralTertiary,
    disabledSubtext: neutralQuaternary,
    disabledBodySubtext: neutralTertiaryAlt,

    focusBorder: neutralSecondary,
    variantBorder: neutralLight,
    variantBorderHovered: neutralTertiary,
    defaultStateBackground: neutralLighterAlt,

    errorText: redDark,
    warningText: '#333333',
    errorBackground: 'rgba(245, 135, 145, .2)',
    blockingBackground: 'rgba(250, 65, 0, .2)',
    warningBackground: 'rgba(255, 200, 10, .2)',
    warningHighlight: '#ffb900',
    successBackground: 'rgba(95, 210, 85, .2)',

    inputBorder: neutralTertiary,
    inputBorderHovered: neutralPrimary,
    inputBackground: white,
    inputBackgroundChecked: themePrimary,
    inputBackgroundCheckedHovered: themeDarkAlt,
    inputForegroundChecked: white,
    inputFocusBorderAlt: themePrimary,
    smallInputBorder: neutralSecondary,
    inputText: neutralPrimary,
    inputTextHovered: neutralDark,
    inputPlaceholderText: neutralSecondary,

    buttonBackground: neutralLighter,
    buttonBackgroundChecked: neutralTertiaryAlt,
    buttonBackgroundHovered: neutralLight,
    buttonBackgroundCheckedHovered: neutralLight,
    buttonBackgroundPressed: neutralLight,
    buttonBackgroundDisabled: neutralLighter,
    buttonBorder: neutralSecondaryAlt,
    buttonText: neutralPrimary,
    buttonTextHovered: neutralDark,
    buttonTextChecked: neutralDark,
    buttonTextCheckedHovered: black,
    buttonTextPressed: neutralDark,
    buttonTextDisabled: neutralTertiary,
    buttonBorderDisabled: neutralLighter,
    buttonBorderFocused: neutralSecondaryAlt,

    primaryButtonBackground: themePrimary,
    primaryButtonBackgroundHovered: themeDarkAlt,
    primaryButtonBackgroundPressed: themeDark,
    primaryButtonBackgroundDisabled: neutralLighter,
    primaryButtonBorder: 'transparent',
    primaryButtonBorderFocused: 'transparent',
    primaryButtonText: white,
    primaryButtonTextHovered: white,
    primaryButtonTextPressed: white,
    primaryButtonTextDisabled: neutralQuaternary,

    accentButtonBackground: accent,
    accentButtonText: white,

    menuBackground: white,
    menuDivider: neutralTertiaryAlt,
    menuIcon: themePrimary,
    menuHeader: themePrimary,
    menuItemBackgroundHovered: neutralLighter,
    menuItemBackgroundPressed: neutralLight,
    menuItemText: neutralPrimary,
    menuItemTextHovered: neutralDark,

    listBackground: white,
    listText: neutralPrimary,
    listItemBackgroundHovered: neutralLighter,
    listItemBackgroundChecked: neutralLight,
    listItemBackgroundCheckedHovered: neutralQuaternaryAlt,

    listHeaderBackgroundHovered: neutralLighter,
    listHeaderBackgroundPressed: neutralLight,

    actionLink: neutralPrimary,
    actionLinkHovered: neutralDark,
    link: themePrimary,
    linkHovered: themeDarker,
    linkPressed: themeDark,
  },
  typography: {
    sizes: { caption: 10, secondary: 12, body: 14, subheader: 16, header: 20, hero: 28, heroLarge: 42 },
    weights: { regular: '400', semiBold: '600' },
    families: {
      primary: 'Segoe UI',
      secondary: 'System',
      cursive: 'System',
      monospace: 'System',
      numeric: 'System',
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
    },
  },
  shadows: {
    shadow2: { ambient: { x: 0, y: 0, blur: 2, color: 'black' }, key: { x: 2, y: 2, blur: 2, color: 'black' } },
    shadow4: { ambient: { x: 0, y: 0, blur: 4, color: 'black' }, key: { x: 4, y: 4, blur: 4, color: 'red' } },
    shadow8: { ambient: { x: 0, y: 0, blur: 8, color: 'black' }, key: { x: 8, y: 8, blur: 8, color: 'orange' } },
    shadow16: { ambient: { x: 0, y: 0, blur: 16, color: 'black' }, key: { x: 16, y: 16, blur: 16, color: 'yellow' } },
    shadow28: { ambient: { x: 0, y: 0, blur: 28, color: 'black' }, key: { x: 28, y: 28, blur: 28, color: 'green' } },
    shadow64: { ambient: { x: 0, y: 0, blur: 64, color: 'black' }, key: { x: 64, y: 64, blur: 64, color: 'blue' } },
    shadow2brand: { ambient: { x: 0, y: 0, blur: 2, color: 'black' }, key: { x: 2, y: 2, blur: 2, color: 'black' } },
    shadow4brand: { ambient: { x: 0, y: 0, blur: 4, color: 'black' }, key: { x: 4, y: 4, blur: 4, color: 'red' } },
    shadow8brand: { ambient: { x: 0, y: 0, blur: 8, color: 'black' }, key: { x: 8, y: 8, blur: 8, color: 'orange' } },
    shadow16brand: { ambient: { x: 0, y: 0, blur: 16, color: 'black' }, key: { x: 16, y: 16, blur: 16, color: 'yellow' } },
    shadow28brand: { ambient: { x: 0, y: 0, blur: 28, color: 'black' }, key: { x: 28, y: 28, blur: 28, color: 'green' } },
    shadow64brand: { ambient: { x: 0, y: 0, blur: 64, color: 'black' }, key: { x: 64, y: 64, blur: 64, color: 'blue' } },
  },
  spacing: { s2: '4px', s1: '8px', m: '16px', l1: '20px', l2: '32px' },
  host: { appearance: 'light' },
  components: {},
};
