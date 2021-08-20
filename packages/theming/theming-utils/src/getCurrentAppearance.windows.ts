import { AppTheme } from 'react-native-windows';
import { AppearanceOptions, ThemeOptions } from '@fluentui-react-native/theme-types';

export function getCurrentAppearance(appearance: ThemeOptions['appearance'], fallback: AppearanceOptions): AppearanceOptions {
  const isDynamic = appearance === 'dynamic';

  if (isDynamic) {
    if (!AppTheme || !AppTheme.isAvailable) {
      return fallback;
    }

    if (AppTheme.isHighContrast) {
      return 'highContrast' as AppearanceOptions;
    } else {
      return AppTheme.currentTheme as AppearanceOptions; // light or dark
    }
  } else {
    return appearance as AppearanceOptions;
  }
}
