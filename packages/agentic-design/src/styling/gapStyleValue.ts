import type { ViewStyle } from 'react-native';

import { getNumericStyleValue } from './numericStyleValue';

/**
 * Accepts the valid gap token surface and narrows to a usable gap value.
 */
export function getGapStyleValue(value: unknown): NonNullable<ViewStyle['gap']> {
  return getNumericStyleValue(value) as NonNullable<ViewStyle['gap']>;
}
