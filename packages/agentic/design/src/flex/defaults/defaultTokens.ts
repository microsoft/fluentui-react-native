import { defaultResolvedThemeAppearance } from '../../theming/appearance';
import type { ColorTone } from '../../types/appearance.types';
import { resolveFlexTokenDescription } from '../colors/interactionPolicy';
import { flexCoolTheme } from '../../themes/flex/flexCoolTheme';
import { flexWarmTheme } from '../../themes/flex/flexWarmTheme';
import type { FlexTokenDescription, FlexTokens } from '../tokens.types';

/**
 * The x3 cool-tone default description. Interactive colors author only the
 * hover and pressed states the interaction policy cannot reproduce.
 */
export const defaultFlexTokenDescription: FlexTokenDescription = flexCoolTheme.tokens;

/** The x3 default description for a color tone. */
export function getDefaultFlexTokenDescription(colorTone: ColorTone): FlexTokenDescription {
  return colorTone === 'warm' ? flexWarmTheme.tokens : flexCoolTheme.tokens;
}

/**
 * Default resolved Flex tokens for the default appearance. Omitted interaction
 * states are computed on first read.
 */
export const defaultFlexTokens: FlexTokens = resolveFlexTokenDescription(defaultFlexTokenDescription, defaultResolvedThemeAppearance);
