import { Appearance } from 'react-native';

import { getCurrentAppearance, isHighContrast, ThemeReference } from '@fluentui-react-native/design/theming';
import type { Theme } from '@fluentui-react-native/design/theming';

import { getBaseAppleThemeMacOS } from './appleTheme.macos';

export function createAppleTheme(): ThemeReference {
  return new ThemeReference({
    base: {} as Theme,
    appearance: {
      colorScheme: 'system',
      contrast: 'system',
      interfaceLevel: 'base',
    },
    recipes: [
      (_theme, appearance) => {
        const mode = appearance?.colorScheme ?? getCurrentAppearance(Appearance.getColorScheme(), 'light');
        const highContrast = appearance ? appearance.contrast === 'highContrast' : isHighContrast();
        return getBaseAppleThemeMacOS(mode, highContrast);
      },
    ],
  });
}
