import { ThemeReference } from '@fluentui-react-native/theme';
import { defaultFluentDarkTheme, defaultFluentHighConstrastTheme, defaultFluentTheme } from './defaultTheme';
import { Appearance } from 'react-native';
import { Theme, ThemeOptions } from '@fluentui-react-native/theme-types';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import assertNever from 'assert-never';

export function createDefaultTheme(options: ThemeOptions = {}): ThemeReference {
  const themeRef = new ThemeReference({} as Theme, () => {
    const current = getCurrentAppearance(options.appearance, options.defaultAppearance || 'light');
    switch (current) {
      case 'light':
        return defaultFluentTheme;
      case 'dark':
        return defaultFluentDarkTheme;
      case 'highContrast':
        return defaultFluentHighConstrastTheme;
      default:
        assertNever(current);
    }
  });

  if (Appearance && options.appearance === 'dynamic') {
    Appearance.addChangeListener(() => {
      themeRef.invalidate();
    });
  }

  return themeRef;
}
