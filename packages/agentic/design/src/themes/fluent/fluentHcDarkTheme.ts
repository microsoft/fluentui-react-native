import { hcDarkAliasColors, hcDarkShadows } from '../../fluent/defaults/fluentTokens.generated';
import type { Theme } from '../../fluent/types/Theme.types';
import { createFluentTheme } from './createFluentTheme';

/**
 * The Fluent high-contrast dark theme, built from Fluent 2 alias and global tokens.
 */
export const fluentHcDarkTheme: Theme = /* @__PURE__ */ createFluentTheme('highContrast', hcDarkAliasColors, hcDarkShadows);
