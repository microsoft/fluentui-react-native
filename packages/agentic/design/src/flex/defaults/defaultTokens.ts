import { defaultResolvedThemeAppearance } from '../../theming/appearance';
import type { ColorTone } from '../../types/appearance.types';
import { resolveFlexTokenDescription } from '../colors/interactionPolicy';
import { createFlexTokenDescription } from '../flexTokenDescription';
import type { FlexTokenDescription, FlexTokens } from '../tokens.types';
import { coolFlexTokenInput, warmFlexTokenInput } from './defaultTokens.generated';

/**
 * The x3 cool-tone default description. Interactive colors author only the
 * hover and pressed states the interaction policy cannot reproduce.
 */
export const defaultFlexTokenDescription: FlexTokenDescription = createFlexTokenDescription(coolFlexTokenInput);

let warmFlexTokenDescription: FlexTokenDescription | undefined;

/** The x3 default description for a color tone. */
export function getDefaultFlexTokenDescription(colorTone: ColorTone): FlexTokenDescription {
  if (colorTone === 'warm') {
    warmFlexTokenDescription ??= createFlexTokenDescription(warmFlexTokenInput);
    return warmFlexTokenDescription;
  }
  return defaultFlexTokenDescription;
}

/**
 * Default resolved Flex tokens for the default appearance. Omitted interaction
 * states are computed on first read.
 */
export const defaultFlexTokens: FlexTokens = resolveFlexTokenDescription(defaultFlexTokenDescription, defaultResolvedThemeAppearance);
