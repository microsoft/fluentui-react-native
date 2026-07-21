import { Appearance } from 'react-native';
import { AppTheme } from 'react-native-windows';

import type { AppearanceOptions, Theme, ThemeOptions } from './types/Theme.types';

export { setIsHighContrast } from './platformUtils.defaults';

export function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  if (appearance === undefined) {
    return fallback;
  }

  if (appearance === 'dynamic') {
    if (!AppTheme || !Appearance) {
      return fallback;
    }

    return AppTheme.isHighContrast ? 'highContrast' : Appearance.getColorScheme();
  }

  return appearance;
}

export function isHighContrast(_theme?: Theme): boolean {
  return AppTheme.isHighContrast;
}
