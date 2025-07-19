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

function isTypeWorker(type: EnhancedTypeof, validTypes: EnhancedTypeof | EnhancedTypeof[]): boolean {
  if (Array.isArray(validTypes)) {
    return validTypes.includes(type);
  } else {
    return type === validTypes;
  }
}

/**
 * Check if a value is of a specific type
 * @param val - value to check
 * @param types - expected types
 * @returns true if the value is of the expected type, false otherwise
 */
export function isType(val: unknown, types: EnhancedTypeof | EnhancedTypeof[]): boolean {
  return isTypeWorker(enhancedTypeof(val), types);
}

/**
 * Check if a value is of a specific type and non-empty, in particular checks array length and object property count
 * @param val - value to check
 * @param types - expected types
 */
export function isNonEmptyType(val: unknown, types: EnhancedTypeof | EnhancedTypeof[]): boolean {
  // falsy values are always considered empty
  if (val) {
    const valType = enhancedTypeof(val);
    if (isTypeWorker(valType, types)) {
      switch (valType) {
        case 'array':
          return (val as unknown[]).length > 0;
        case 'object':
          return Object.getOwnPropertyNames(val).length > 0;
        default:
          return true;
      }
    }
  }
  return false;
}
