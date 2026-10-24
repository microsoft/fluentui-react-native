import { Appearance } from 'react-native';

import type { AppearanceOptions, Theme, ThemeOptions } from './types/Theme.types';

export function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  if (appearance === undefined || appearance === null) {
    return fallback;
  }

  return appearance === 'dynamic' ? (Appearance && Appearance.getColorScheme()) || fallback : appearance;
}

export function setIsHighContrast(_isHighContrast: boolean) {
  // High contrast state is managed externally on platforms other than macOS.
}

export function isHighContrast(_theme?: Theme): boolean {
  return false;
}
