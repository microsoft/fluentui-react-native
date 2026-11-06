import type { Theme } from '../../fluent/types/Theme.types';
import type { ResolvedThemeAppearance } from '../../types/appearance.types';
import { fluentDarkTheme } from './fluentDarkTheme';
import { fluentHcDarkTheme } from './fluentHcDarkTheme';
import { fluentHcLightTheme } from './fluentHcLightTheme';
import { fluentLightTheme } from './fluentLightTheme';

/**
 * Select the Fluent theme for a resolved appearance. High contrast selects the high-contrast theme for the color
 * scheme; elevated appearances resolve by color scheme until those Fluent themes exist.
 */
export function selectFluentTheme(appearance: ResolvedThemeAppearance | undefined): Theme {
  const dark = appearance?.colorScheme === 'dark';
  if (appearance?.contrast === 'highContrast') {
    return dark ? fluentHcDarkTheme : fluentHcLightTheme;
  }
  return dark ? fluentDarkTheme : fluentLightTheme;
}
