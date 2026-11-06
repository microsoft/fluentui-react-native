import { getDefaultFlexTokenDescription } from '../../flex/defaults/defaultTokens';
import type { FlexThemeDescription } from '../../flex/themeState.types';

/**
 * The warm-tone Flex theme: the x3 warm default tokens for light and dark.
 */
export const flexWarmTheme: FlexThemeDescription = { tokens: /* @__PURE__ */ getDefaultFlexTokenDescription('warm'), colorTone: 'warm' };
