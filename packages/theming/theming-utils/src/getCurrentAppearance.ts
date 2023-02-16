import type { AppearanceOptions, ThemeOptions } from '@fluentui-react-native/theme-types';
import { Appearance } from 'react-native';

export function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  if (appearance === undefined) {
    return fallback;
  }

  return appearance === 'dynamic' ? (Appearance && Appearance.getColorScheme()) || fallback : appearance;
}
