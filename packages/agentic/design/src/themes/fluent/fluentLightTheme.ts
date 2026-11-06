import { lightAliasColors, lightShadows } from '../../fluent/defaults/fluentTokens.generated';
import type { Theme } from '../../fluent/types/Theme.types';
import { createFluentTheme } from './createFluentTheme';

/**
 * The Fluent light theme, built from Fluent 2 alias and global tokens.
 */
export const fluentLightTheme: Theme = /* @__PURE__ */ createFluentTheme('light', lightAliasColors, lightShadows);
