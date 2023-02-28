import { Appearance } from 'react-native';

import { ThemeReference } from '@fluentui-react-native/theme';
import type { Theme, ThemeOptions } from '@fluentui-react-native/theme-types';

import { getAndroidTheme } from './androidTheme';

export function createAndroidTheme(options: ThemeOptions = {}): ThemeReference {
  const themeRef = new ThemeReference({} as Theme, () => {
    // Stub out HC and darkElevated on Android
    const current =
      options.appearance === 'dynamic' || options.appearance === 'highContrast' || options.appearance === 'darkElevated'
        ? (Appearance && Appearance.getColorScheme()) || 'light'
        : options.appearance;
    return getAndroidTheme(current);
  });

  if (Appearance && options.appearance === 'dynamic') {
    Appearance.addChangeListener(() => {
      themeRef.invalidate();
    });
  }

  return themeRef;
}
