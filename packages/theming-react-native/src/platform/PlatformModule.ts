import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import { INativeThemeDefinition, INativeTheme } from '../INativeTheme';
import { augmentPlatformTheme } from '../Global';

let _emitter: NativeEventEmitter | undefined;
let _eventNameOnPlatformDefaultsChanged: string;

export function initializePlatformModule(): void {
  const platformOS: string = Platform.OS as string;
  if (platformOS === 'macos' || platformOS === 'ios') {
    _initializeRegistryApple();
  } else {
    _initializeRegistryWindowsOrAndroid();
  }
}

function _initializeRegistryWindowsOrAndroid(): void {
  const ThemingModule = NativeModules.Theming;
  if (ThemingModule) {
    // pull in the constant definitions from the native module
    augmentPlatformTheme(ThemingModule.platformDefaults);

    // now register for theme updates
    _eventNameOnPlatformDefaultsChanged = 'onPlatformDefaultsChanged';
    _emitter = new NativeEventEmitter(ThemingModule);
    _emitter.addListener(_eventNameOnPlatformDefaultsChanged, (updatedPlatformDefaults: INativeTheme) => {
      augmentPlatformTheme(updatedPlatformDefaults);
    });
  }
}

function _initializeRegistryApple(): void {
  const partialTheme: INativeThemeDefinition = {};

  const PalettesModule = NativeModules.Palettes;
  if (PalettesModule) {
    const colorsKey = Platform.OS === 'ios' ? 'ios' : 'macos-semantic';
    const colors = PalettesModule[colorsKey];
    partialTheme.palette = {
      bodyText: colors.Text,
      bodyTextChecked: colors.Text,
      bodySubtext: colors.TextSecondary,
      link: colors.TextLink,
      linkHovered: colors.TextLink,
      disabledText: colors.TextDisabled,
      disabledBodyText: colors.TextDisabled,
      disabledSubtext: colors.TextDisabled,
      disabledBodySubtext: colors.TextDisabled,
      warningText: colors.TextEmphasis,
      inputText: colors.Text,
      inputTextHovered: colors.Text,
      inputPlaceholderText: colors.Text,
      buttonText: colors.Text,
      buttonTextHovered: colors.Text,
      buttonTextChecked: colors.Text,
      buttonTextCheckedHovered: colors.Text,
      buttonTextPressed: colors.Text,
      buttonTextDisabled: colors.TextDisabled,
      listText: colors.Text,
      bodyBackground: colors.Bkg,
      bodyStandoutBackground: colors.Bkg,
      bodyFrameBackground: colors.Bkg,
      bodyFrameDivider: colors.Bkg,
      bodyDivider: colors.Bkg,
      disabledBackground: colors.Bkg,
      errorBackground: colors.Bkg,
      blockingBackground: colors.Bkg,
      warningBackground: colors.Bkg,
      successBackground: colors.Bkg,
      inputBackground: colors.Bkg,
      inputBackgroundChecked: colors.Bkg,
      inputBackgroundCheckedHovered: colors.Bkg,
      inputForegroundChecked: colors.Bkg,
      inputFocusBorderAlt: colors.Bkg,
      buttonBackground: colors.Bkg,
      buttonBackgroundChecked: colors.Bkg,
      buttonBackgroundHovered: colors.Bkg,
      buttonBackgroundCheckedHovered: colors.Bkg,
      buttonBackgroundDisabled: colors.Bkg,
      buttonBackgroundPressed: colors.Bkg,
      buttonBorder: colors.Bkg,
      buttonBorderDisabled: colors.Bkg,
      primaryButtonBackground: colors.Bkg,
      primaryButtonBackgroundHovered: colors.Bkg,
      primaryButtonBackgroundPressed: colors.Bkg,
      primaryButtonBackgroundDisabled: colors.Bkg,
      primaryButtonBorder: colors.Bkg,
      listItemBackgroundHovered: colors.Bkg,
      listItemBackgroundChecked: colors.Bkg,
      listItemBackgroundCheckedHovered: colors.Bkg,
      listHeaderBackgroundHovered: colors.Bkg,
      listHeaderBackgroundPressed: colors.Bkg
    };
  }

  const TextStylesModule = NativeModules.TextStyles;
  if (TextStylesModule) {
    partialTheme.typography = {
      families: {
        primary: TextStylesModule.fontFamilyStandard,
        secondary: TextStylesModule.fontFamilySemilight,
        cursive: TextStylesModule.fontFamilyStandard,
        monospace: TextStylesModule.fontFamilyEmphasis,
        sansSerif: TextStylesModule.fontFamilyStandard,
        serif: TextStylesModule.fontFamilyStandard
      },
      sizes: {
        xxxSmall: TextStylesModule.fontSizeSmall,
        xxSmall: TextStylesModule.fontSizeSmall,
        xSmall: TextStylesModule.fontSizeSmall,
        small: TextStylesModule.fontSizeSmall,
        medium: TextStylesModule.fontSizeNormal,
        large: TextStylesModule.fontSizeLarge,
        xLarge: TextStylesModule.fontSizeLargePlus,
        xxLarge: TextStylesModule.fontSizeExtraLarge,
        xxxLarge: TextStylesModule.fontSizeHuge
      }
    };
  }

  if (partialTheme.typography || partialTheme.palette) {
    augmentPlatformTheme(partialTheme);
  }
}
