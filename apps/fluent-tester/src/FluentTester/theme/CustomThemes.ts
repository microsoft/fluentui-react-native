import { createDefaultTheme, ThemeOptions } from '@fluentui-react-native/default-theme';
import { ThemeReference } from '@fluentui-react-native/theme';
import { applyBrand, OfficeBrand } from './applyBrand';
import { applyTheme, ThemeNames } from './applyTheme';

const themeOptions: ThemeOptions = { paletteName: 'TaskPane', appearance: 'dynamic' };
const baseTheme = createDefaultTheme(themeOptions);

export const lightnessOptions = [
  { label: 'Auto', value: 'dynamic' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export class TesterThemeReference extends ThemeReference {
  private _themeName: ThemeNames = 'Apple';
  private _brand: OfficeBrand = 'Default';

  private options: ThemeOptions;
  private baseTheme: ThemeReference;

  constructor() {
    super(
      baseTheme,
      (parent) => applyTheme(parent, this._themeName),
      () => applyBrand(this._brand),
    );
    this.baseTheme = baseTheme;
    this.options = themeOptions;
  }

  /** get/set the currently active theme */
  public get themeName(): ThemeNames {
    return this._themeName;
  }
  public set themeName(newTheme: ThemeNames) {
    this._themeName = newTheme;
    this.invalidate();
  }

  /** get/set the theme appearance */
  public get appearance(): ThemeOptions['appearance'] {
    return this.options.appearance;
  }
  public set appearance(lightness: ThemeOptions['appearance']) {
    this.options.appearance = lightness;
    this.baseTheme.invalidate();
  }

  /** get/set the applied brand */
  public get brand(): OfficeBrand {
    return this._brand;
  }
  public set brand(newBrand: OfficeBrand) {
    this._brand = newBrand;
    this.invalidate();
  }
}

export const testerTheme = new TesterThemeReference();
