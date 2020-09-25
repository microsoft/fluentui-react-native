import { ThemeReference } from '@fluentui-react-native/theme';
import { defaultFluentDarkTheme, defaultFluentTheme } from './defaultTheme';
import { Appearance } from 'react-native';
import { Theme } from '@fluentui-react-native/theme-types';

export type AppearanceOptions = 'light' | 'dark';

export interface DefaultThemeOptions {
  /**
   * Should the baseline colors be light, dark, or use the values from the Appearance API from react-native.
   */
  appearance?: AppearanceOptions | 'dynamic';

  /**
   * Default appearance should the library to request this from native not be available
   */
  defaultAppearance?: AppearanceOptions;
}

function getCurrentAppearance(fallback: AppearanceOptions): AppearanceOptions {
  return (Appearance && Appearance.getColorScheme()) || fallback;
}

export function createDefaultTheme(options: DefaultThemeOptions = {}): ThemeReference {
  const { defaultAppearance = 'light', appearance = 'light' } = options;

  const themeRef = new ThemeReference({} as Theme, () => {
    const current = getCurrentAppearance(defaultAppearance);
    return current === 'light' ? defaultFluentTheme : defaultFluentDarkTheme;
  });

  if (Appearance && appearance === 'dynamic') {
    Appearance.addChangeListener(() => {
      themeRef.invalidate();
    });
  }

  return themeRef;
}
