import { Appearance } from 'react-native';

import { ThemeReference } from '@fluentui-react-native/theme';
import type { Theme, ThemeOptions } from '@fluentui-react-native/theme-types';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import assertNever from 'assert-never';

import { defaultFluentDarkTheme, defaultFluentHighConstrastTheme, defaultFluentTheme } from './defaultTheme';

export function createDefaultTheme(options: ThemeOptions = {}): ThemeReference {
  const themeRef = new ThemeReference({} as Theme, () => {
    const current = getCurrentAppearance(options.appearance, options.defaultAppearance || 'light');
    switch (current) {
      case 'light':
        return defaultFluentTheme;
      case 'dark':
        return defaultFluentDarkTheme;
      case 'darkElevated':
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
