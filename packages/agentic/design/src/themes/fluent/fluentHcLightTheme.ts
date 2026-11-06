import { hcLightAliasColors, hcLightShadows } from '../../fluent/defaults/fluentTokens.generated';
import type { Theme } from '../../fluent/types/Theme.types';
import { createFluentTheme } from './createFluentTheme';

/**
 * The Fluent high-contrast light theme, built from Fluent 2 alias and global tokens.
 */
export const fluentHcLightTheme: Theme = /* @__PURE__ */ createFluentTheme('highContrast', hcLightAliasColors, hcLightShadows);
