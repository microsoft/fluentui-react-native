import { ThemeReference } from '@fluentui-react-native/theme';
import { getAndroidTheme } from './androidTheme';
import { Appearance } from 'react-native';
import { Theme } from '@fluentui-react-native/theme-types';

export interface ThemeOptions {
  appearance?: 'light' | 'dark' | 'dynamic';
  paletteName?: string;
}

export function createAndroidTheme(options: ThemeOptions = {}): ThemeReference {
  const themeRef = new ThemeReference({} as Theme, () => {
    const current = options.appearance == 'dynamic' ? (Appearance && Appearance.getColorScheme()) || 'light' : options.appearance;
    return getAndroidTheme(current);
  });

  if (Appearance && options.appearance === 'dynamic') {
    Appearance.addChangeListener(() => {
      themeRef.invalidate();
    });
  }

  return themeRef;
}
