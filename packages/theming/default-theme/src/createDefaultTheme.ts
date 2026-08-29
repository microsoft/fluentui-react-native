import { ThemeReference } from '@fluentui-react-native/design/theming';
import type { Theme, ThemeOptions } from '@fluentui-react-native/design/theming';
import {
  appearanceOptionFromResolved,
  appearanceOptionsFromLegacy,
  getCurrentAppearance,
  resolveThemeAppearance,
} from '@fluentui-react-native/design/theming';
import assertNever from 'assert-never';

import { defaultFluentDarkTheme, defaultFluentHighConstrastTheme, defaultFluentTheme } from './defaultTheme';

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
