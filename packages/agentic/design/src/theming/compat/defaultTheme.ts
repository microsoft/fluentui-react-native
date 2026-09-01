import assertNever from 'assert-never';

import { appearanceOptionFromResolved, appearanceOptionsFromLegacy, resolveThemeAppearance } from '../appearance';
import { getCurrentAppearance } from '../platformUtils';
import { ThemeReference } from '../themeReference';
import type { Theme, ThemeOptions } from '../types/Theme.types';

import { getDefaultLegacyTheme } from './defaultLegacyTheme';

export const defaultFluentTheme = getDefaultLegacyTheme({
  colorScheme: 'light',
  contrast: 'standard',
  interfaceLevel: 'base',
});

export const defaultFluentDarkTheme = getDefaultLegacyTheme({
  colorScheme: 'dark',
  contrast: 'standard',
  interfaceLevel: 'base',
});

export const defaultFluentHighConstrastTheme = getDefaultLegacyTheme({
  colorScheme: 'dark',
  contrast: 'highContrast',
  interfaceLevel: 'base',
});

export function createDefaultTheme(options: ThemeOptions = {}): ThemeReference {
  return new ThemeReference({
    base: {} as Theme,
    getAppearance: () => appearanceOptionsFromLegacy(options.appearance ?? options.defaultAppearance ?? 'light'),
    getFallbackAppearance: () => resolveThemeAppearance(appearanceOptionsFromLegacy(options.defaultAppearance ?? 'light')).resolved,
    recipes: [
      (_theme, resolvedAppearance) => {
        const current = resolvedAppearance
          ? appearanceOptionFromResolved(resolvedAppearance)
          : getCurrentAppearance(options.appearance, options.defaultAppearance ?? 'light');
        switch (current) {
          case 'light':
            return defaultFluentTheme;
          case 'dark':
          case 'darkElevated':
            return defaultFluentDarkTheme;
          case 'highContrast':
            return defaultFluentHighConstrastTheme;
          default:
            assertNever(current);
        }
      },
    ],
  });
}
