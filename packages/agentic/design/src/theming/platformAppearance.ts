import { Appearance } from 'react-native';

import { createThemeAppearanceSource } from './appearanceSource';

export const platformAppearance = createThemeAppearanceSource(
  () => ({ colorScheme: Appearance.getColorScheme() }),
  (listener) => {
    const subscription = Appearance.addChangeListener(listener);
    return () => subscription.remove();
  },
);

export function setPlatformHighContrast(enabled: boolean): void {
  void enabled;
}
