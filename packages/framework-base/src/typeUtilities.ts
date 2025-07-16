import type { EnhancedTypeof } from './types';

/**
 * Provide a more sensible type result that expands upon the built in typeof operator
 * In particular this will differentiate arrays and nulls from standard objects
 * @param val - value to check type
 */
export function enhancedTypeof(val: unknown): EnhancedTypeof {
  const result = typeof val;
  if (result === 'object') {
    if (val === null) {
      return 'null';
    } else if (Array.isArray(val)) {
      return 'array';
    }
  }
  return result;
}
