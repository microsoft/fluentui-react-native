import { ThemeReference } from '../../fluent/themeReference';
import type { Theme } from '../../fluent/types/Theme.types';
import { fluentDarkTheme } from './fluentDarkTheme';
import { fluentHcDarkTheme } from './fluentHcDarkTheme';
import { fluentHcLightTheme } from './fluentHcLightTheme';
import { fluentLightTheme } from './fluentLightTheme';

/**
 * Theme source holding every Fluent theme. It follows the system appearance reported by the React Native `Appearance`
 * module, and a `ThemeProvider` or `ThemedRoot` `appearance` prop overrides it. High contrast selects the
 * high-contrast theme for the color scheme; elevated system settings resolve by color scheme until those Fluent themes
 * exist.
 */
export const fluentTheme: ThemeReference = /* @__PURE__ */ new ThemeReference({
  base: {} as Theme,
  appearance: { colorScheme: 'system', contrast: 'system', interfaceLevel: 'system' },
  recipes: [
    (_parent, appearance) => {
      const dark = appearance?.colorScheme === 'dark';
      if (appearance?.contrast === 'highContrast') {
        return dark ? fluentHcDarkTheme : fluentHcLightTheme;
      }
      return dark ? fluentDarkTheme : fluentLightTheme;
    },
  ],
});
