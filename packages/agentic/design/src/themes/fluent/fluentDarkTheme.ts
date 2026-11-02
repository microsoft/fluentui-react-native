import { darkAliasColors, darkShadows } from '../../fluent/defaults/fluentTokens.generated';
import type { Theme } from '../../fluent/types/Theme.types';
import { createFluentTheme } from './createFluentTheme';

/**
 * The Fluent dark theme, built from Fluent 2 alias and global tokens.
 */
export const fluentDarkTheme: Theme = /* @__PURE__ */ createFluentTheme('dark', darkAliasColors, darkShadows);
