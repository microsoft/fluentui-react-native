import { Appearance } from 'react-native';

import type { AppearanceOptions, ThemeOptions } from '@fluentui-react-native/theme-types';

export function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  if (appearance === undefined || appearance === null) {
    return fallback;
  }

  return appearance === 'dynamic' ? (Appearance && Appearance.getColorScheme()) || fallback : appearance;
}
