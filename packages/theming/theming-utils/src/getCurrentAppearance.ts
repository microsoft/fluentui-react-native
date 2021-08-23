import { Appearance } from 'react-native';
import { AppearanceOptions, ThemeOptions } from '@fluentui-react-native/theme-types';

export function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  if (appearance === undefined) {
    return fallback;
  }

  return appearance === 'dynamic' ? (Appearance && Appearance.getColorScheme()) || fallback : appearance;
}
