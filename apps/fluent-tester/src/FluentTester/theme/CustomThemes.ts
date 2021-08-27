import { createAppleTheme } from '@fluentui-react-native/apple-theme';
import { createDefaultTheme } from '@fluentui-react-native/default-theme';
import { ThemeReference } from '@fluentui-react-native/theme';
import { Platform } from 'react-native';
import { applyBrand, OfficeBrand } from './applyBrand';
import { applyTheme, ThemeNames } from './applyTheme';
import { createAndroidTheme } from '@fluentui-react-native/android-theme';
import { ThemeOptions } from '@fluentui-react-native/theme-types';

const themeOptions: ThemeOptions = { paletteName: 'TaskPane', appearance: 'dynamic' };

// Default applies to win32
const baseTheme = Platform.select({
  android: createAndroidTheme(themeOptions),
  ios: createAppleTheme(),
  macos: createAppleTheme(),
  default: createDefaultTheme(themeOptions),
});

const supportsHighContrastTokens: boolean = Platform.select({
  android: false,
  ios: false,
  macos: false,
  default: true,
});

export const lightnessOptions = [
  { label: 'Auto', value: 'dynamic' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  supportsHighContrastTokens && { label: 'High Contrast', value: 'highContrast' },
];

export class TesterThemeReference extends ThemeReference {
  private _themeName: ThemeNames = 'Default';
  private _brand: OfficeBrand = 'Default';

  private options: ThemeOptions;
  private baseTheme: ThemeReference;

  constructor() {
    super(baseTheme, parent => applyTheme(parent, this._themeName, this.options.appearance), () => applyBrand(this._brand));
    this.baseTheme = baseTheme;
    this.options = themeOptions;
  }

  /** get/set the currently active theme */
  public get themeName(): ThemeNames {
    return this._themeName;
  }
  public set themeName(newTheme: ThemeNames) {
    if (newTheme !== this._themeName) {
      this._themeName = newTheme;
      this.invalidate();
    }
  }

  /** get/set the theme appearance */
  public get appearance(): ThemeOptions['appearance'] {
    return this.options.appearance;
  }
  public set appearance(lightness: ThemeOptions['appearance']) {
    if (lightness !== this.options.appearance) {
      this.options.appearance = lightness;
      this.baseTheme.invalidate();
    }
  }

  /** get/set the applied brand */
  public get brand(): OfficeBrand {
    return this._brand;
  }
  public set brand(newBrand: OfficeBrand) {
    if (newBrand !== this._brand) {
      this._brand = newBrand;
      this.invalidate();
    }
  }
}

export const testerTheme = new TesterThemeReference();
