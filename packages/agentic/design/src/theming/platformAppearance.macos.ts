import { Appearance } from 'react-native';
import { AccessibilityInfo } from 'react-native-macos';

import { createThemeAppearanceSource } from './appearanceSource';

let highContrast = false;

export const platformAppearance = createThemeAppearanceSource(
  () => ({
    colorScheme: Appearance.getColorScheme(),
    contrast: highContrast ? 'highContrast' : 'standard',
  }),
  (listener) => {
    const appearanceSubscription = Appearance.addChangeListener(listener);
    const highContrastSubscription = AccessibilityInfo.addEventListener('highContrastChanged', (enabled) => {
      highContrast = enabled;
      listener();
    });
    void AccessibilityInfo.isHighContrastEnabled().then((enabled) => {
      highContrast = enabled;
      listener();
    });
    return () => {
      appearanceSubscription.remove();
      highContrastSubscription.remove();
    };
  },
);

export function setPlatformHighContrast(enabled: boolean): void {
  highContrast = enabled;
  platformAppearance.refresh();
}
