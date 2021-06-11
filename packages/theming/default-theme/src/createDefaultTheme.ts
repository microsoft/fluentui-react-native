import { ThemeReference } from '@fluentui-react-native/theme';
import { defaultFluentDarkTheme, defaultFluentTheme } from './defaultTheme';
import { Appearance } from 'react-native';
import { Theme } from '@fluentui-react-native/theme-types';

export type AppearanceOptions = 'light' | 'dark';

export interface ThemeOptions {
  /**
   * Should the baseline colors be light, dark, or use the values from the Appearance API from react-native.
   */
  appearance?: AppearanceOptions | 'dynamic';

  /**
   * Default appearance should the library to request this from native not be available
   */
  defaultAppearance?: AppearanceOptions;

  /**
   * If in a host that supports multiple areas within the app that use different palettes, this specifies the palette name to
   * load.
   *
   * In Office this corresponds to regions like taskpanes, the ribbon, left navigation, and so on, but that concept could be extended
   * to any host that wants to support this.
   */
  paletteName?: string;
}

export function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  return appearance === 'dynamic' ? (Appearance && Appearance.getColorScheme()) || fallback : appearance;
}

export function createDefaultTheme(options: ThemeOptions = {}): ThemeReference {
  const themeRef = new ThemeReference({} as Theme, () => {
    const current = getCurrentAppearance(options.appearance, options.defaultAppearance || 'light');
    return current === 'light' ? defaultFluentTheme : defaultFluentDarkTheme;
  });

  if (Appearance && options.appearance === 'dynamic') {
    Appearance.addChangeListener(() => {
      themeRef.invalidate();
    });
  }

  return themeRef;
}
