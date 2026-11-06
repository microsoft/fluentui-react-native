import { flexCoolTheme } from './flexCoolTheme';
import { flexWarmTheme } from './flexWarmTheme';
import type { FlexThemeDescription } from '../../flex/themeState.types';

/**
 * The adaptive Flex theme, selecting its palette from the resolved color tone.
 */
export const flexTheme = {
  tokens: (appearance) => (appearance.colorTone === 'warm' ? flexWarmTheme.tokens : flexCoolTheme.tokens),
} satisfies FlexThemeDescription;
