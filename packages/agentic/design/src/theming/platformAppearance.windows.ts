import { Appearance } from 'react-native';
import { AppTheme } from 'react-native-windows';

import { createThemeAppearanceSource } from './appearanceSource';

export const platformAppearance = createThemeAppearanceSource(
  () => ({
    colorScheme: Appearance.getColorScheme(),
    contrast: AppTheme.isHighContrast ? 'highContrast' : 'standard',
  }),
  (listener) => {
    const appearanceSubscription = Appearance.addChangeListener(listener);
    const highContrastSubscription = AppTheme.addListener('highContrastChanged', listener);
    return () => {
      appearanceSubscription.remove();
      highContrastSubscription.remove();
    };
  },
);
