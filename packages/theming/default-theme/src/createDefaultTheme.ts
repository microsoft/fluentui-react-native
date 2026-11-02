import { appearanceOptionsFromLegacy, resolveThemeAppearance, ThemeReference } from '@fluentui-react-native/design/theming';
import type { Theme, ThemeOptions } from '@fluentui-react-native/design/theming';
import { fluentTheme } from '@fluentui-react-native/design/themes';

/**
 * Create a theme reference for legacy theme options. It resolves the design package's Fluent themes, including the
 * high-contrast themes, for the requested appearance.
 */
export function createDefaultTheme(options: ThemeOptions = {}): ThemeReference {
  const getAppearance = () => appearanceOptionsFromLegacy(options.appearance ?? options.defaultAppearance ?? 'light');
  const getFallbackAppearance = () => resolveThemeAppearance(appearanceOptionsFromLegacy(options.defaultAppearance ?? 'light')).resolved;
  return new ThemeReference({
    base: {} as Theme,
    getAppearance,
    getFallbackAppearance,
    recipes: [
      (_theme, appearance) =>
        fluentTheme.resolveTheme(appearance ?? resolveThemeAppearance(getAppearance(), undefined, getFallbackAppearance()).resolved),
    ],
  });
}
