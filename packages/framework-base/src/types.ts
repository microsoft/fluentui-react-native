/**
 * Base object type for merges, avoids using object since that is too broad. In particular things like null and arrays
 * are not valid object types for the purposes of this library.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ObjectBase = {};

/**
 * Type for an indexable object with unknown values.
 */
export type UnknownObject = Record<string, unknown>;

/**
 * Expanded types for the built-in javascript typeof operator, in particular splitting out arrays and nulls from standard objects.
 */
export type TypeofResult = 'undefined' | 'object' | 'boolean' | 'number' | 'string' | 'symbol' | 'bigint' | 'function';
export type EnhancedTypeof = TypeofResult | 'array' | 'null';
