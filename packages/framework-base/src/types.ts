import type React from 'react';

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

/**
 * A generic function that accepts any args and returns a value of type T. Note that unknown doesn't work quite right for functions
 * that may have any parameter (or none) so we use any here. The values will be strongly typed in the actual usage and simply passed
 * through without modification.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction<T> = (...args: any[]) => T;

/** Base type for props, this is just an empty object type to allow extension */
export type PropsBase = Record<string, unknown>;

/** Base props type, to declaratively say this props field does not expect children */
export type PropsNoChildrenBase = PropsBase;

/** Base props type, but with children included in the props */
export type PropsWithChildrenBase = React.PropsWithChildren<PropsBase>;

/**
 * The standard element type inputs for react and react-native. This might be View or Button, or it might be 'div' in web. Effectively
 * it is what react accepts for React.createElement
 */
export type NativeReactElement<TProps extends PropsBase = PropsBase> = React.ElementType<TProps> | string;
