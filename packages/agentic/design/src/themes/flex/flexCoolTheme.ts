import { coolFlexTokenInput } from '../../flex/defaults/coolTokens.generated';
import { createFlexTokenDescription } from '../../flex/flexTokenDescription';
import type { FlexThemeDescription } from '../../flex/themeState.types';

/** The cool-tone Flex theme, covering light and dark without the warm palette. */
export const flexCoolTheme = {
  tokens: /* @__PURE__ */ createFlexTokenDescription(coolFlexTokenInput),
  colorTone: 'cool',
} satisfies FlexThemeDescription;
