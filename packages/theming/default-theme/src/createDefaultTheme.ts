import { ThemeReference } from '@fluentui-react-native/theme';
import { defaultFluentDarkTheme, defaultFluentTheme } from './defaultTheme';
import { Appearance } from 'react-native';
import { Theme, ThemeOptions } from '@fluentui-react-native/theme-types';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';

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
