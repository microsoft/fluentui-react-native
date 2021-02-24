import { ThemeReference } from '@fluentui-react-native/theme';
import { getAndroidTheme } from './androidTheme';
import { Appearance } from 'react-native';
import { Theme } from '@fluentui-react-native/theme-types';

export type AppearanceOptions = 'light' | 'dark';

export interface ThemeOptions {
  appearance?: AppearanceOptions | 'dynamic';
}

function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  return appearance === 'dynamic' ? (Appearance && Appearance.getColorScheme()) || fallback : appearance;
}

export function createAndroidTheme(options: ThemeOptions = {}): ThemeReference {
  const themeRef = new ThemeReference({} as Theme, () => {
    const current = getCurrentAppearance(options.appearance, 'light');
    return getAndroidTheme(current);
  });

  if (Appearance && options.appearance === 'dynamic') {
    Appearance.addChangeListener(() => {
      themeRef.invalidate();
    });
  }

  return themeRef;
}
