import { fontFamilyBase } from './global.generated';
import type { FlexTokens } from './flex.types';

/**
 * Flex token defaults whose source cannot be expressed by the legacy Theme.
 */
export const nonFluentFlexTokens = {
  fontFamily: {
    contentEditorial: fontFamilyBase,
  },
} as const satisfies { fontFamily: Partial<FlexTokens['fontFamily']> };
