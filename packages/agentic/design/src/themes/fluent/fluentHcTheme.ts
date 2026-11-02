import { ThemeReference } from '../../fluent/themeReference';
import type { Theme } from '../../fluent/types/Theme.types';
import { fluentHcDarkTheme } from './fluentHcDarkTheme';
import { fluentHcLightTheme } from './fluentHcLightTheme';

/**
 * Theme source holding the Fluent high-contrast themes. It always resolves high contrast and follows the system color
 * scheme reported by the React Native `Appearance` module; a `ThemeProvider` or `ThemedRoot` `appearance` prop
 * overrides the color scheme.
 */
export const fluentHcTheme: ThemeReference = /* @__PURE__ */ new ThemeReference({
  base: {} as Theme,
  appearance: { colorScheme: 'system', contrast: 'highContrast', interfaceLevel: 'system' },
  recipes: [(_parent, appearance) => (appearance?.colorScheme === 'dark' ? fluentHcDarkTheme : fluentHcLightTheme)],
});
