import { warmFlexTokenInput } from '../../flex/defaults/warmTokens.generated';
import { createFlexTokenDescription } from '../../flex/flexTokenDescription';
import type { FlexThemeDescription } from '../../flex/themeState.types';

/**
 * The warm-tone Flex theme: the x3 warm default tokens for light and dark.
 */
export const flexWarmTheme = {
  tokens: /* @__PURE__ */ createFlexTokenDescription(warmFlexTokenInput),
  colorTone: 'warm',
} satisfies FlexThemeDescription;
