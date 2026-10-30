import { ThemeReference } from '../../fluent/themeReference';
import type { Theme } from '../../fluent/types/Theme.types';
import { fluentDarkTheme } from './fluentDarkTheme';
import { fluentLightTheme } from './fluentLightTheme';

/**
 * Theme source holding both Fluent themes. It follows the system appearance reported by the React Native `Appearance`
 * module, and a `ThemeProvider` or `ThemedRoot` `appearance` prop overrides it. High contrast and elevated system
 * settings resolve by color scheme until those Fluent themes exist.
 */
export const fluentTheme: ThemeReference = /* @__PURE__ */ new ThemeReference({
  base: {} as Theme,
  appearance: { colorScheme: 'system', contrast: 'system', interfaceLevel: 'system' },
  recipes: [(_parent, appearance) => (appearance?.colorScheme === 'dark' ? fluentDarkTheme : fluentLightTheme)],
});
