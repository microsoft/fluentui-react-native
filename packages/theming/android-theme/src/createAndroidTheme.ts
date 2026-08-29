import { Appearance } from 'react-native';

import { ThemeReference } from '@fluentui-react-native/design/theming';
import type { Theme, ThemeOptions } from '@fluentui-react-native/design/theming';
import { appearanceOptionsFromLegacy, resolveThemeAppearance } from '@fluentui-react-native/design/theming';

import { getAndroidTheme } from './androidTheme';

export function createAndroidTheme(options: ThemeOptions = {}): ThemeReference {
  return new ThemeReference({
    base: {} as Theme,
    getAppearance: () => getAndroidAppearance(options.appearance ?? options.defaultAppearance ?? 'light'),
    getFallbackAppearance: () => resolveThemeAppearance(getAndroidAppearance(options.defaultAppearance ?? 'light')).resolved,
    recipes: [
      (_theme, resolvedAppearance) => {
        // Preserve the legacy direct-access path while ThemeProvider uses the
        // structured appearance passed to resolveTheme.
        const current = resolvedAppearance
          ? resolvedAppearance.colorScheme
          : options.appearance === 'dynamic' || options.appearance === 'highContrast' || options.appearance === 'darkElevated'
            ? (Appearance && Appearance.getColorScheme()) || options.defaultAppearance || 'light'
            : options.appearance || options.defaultAppearance || 'light';
        return getAndroidTheme(current);
      },
    ],
  });
}

function getAndroidAppearance(appearance: NonNullable<ThemeOptions['appearance']>) {
  return appearance === 'darkElevated' || appearance === 'highContrast' || appearance === 'dynamic'
    ? { colorScheme: 'system' as const, contrast: 'standard' as const, interfaceLevel: 'base' as const }
    : appearanceOptionsFromLegacy(appearance);
}
