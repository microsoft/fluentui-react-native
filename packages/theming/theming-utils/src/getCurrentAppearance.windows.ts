import { Appearance } from 'react-native';

import type { AppearanceOptions, ThemeOptions } from '@fluentui-react-native/theme-types';
import { AppTheme } from 'react-native-windows';

export function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  if (appearance === undefined) {
    return fallback;
  }

  const isDynamic = appearance === 'dynamic';

  if (isDynamic) {
    if (!AppTheme || !Appearance) {
      return fallback;
    }

    if (AppTheme.isHighContrast) {
      return 'highContrast' as AppearanceOptions;
    } else {
      return Appearance.getColorScheme(); // light or dark
    }
  } else {
    return appearance as AppearanceOptions;
  }
}
