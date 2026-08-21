import type { FlexTokens } from './flex.types';
import { defaultFlexTokens } from './defaultTokens';

/**
 * Hook to access the current set of Flex tokens.
 * @returns The current Flex tokens.
 */
export function useFlexTokens(): FlexTokens {
  return defaultFlexTokens;
}
