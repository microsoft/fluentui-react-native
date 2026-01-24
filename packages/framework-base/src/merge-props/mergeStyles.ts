import { immutableMerge } from '../immutable-merge/Merge';
import { getMemoCache } from '../memo-cache/getMemoCache';

import type { StyleProp } from './mergeStyles.types';

/**
 * Take a react-native style, which may be a recursive array, and return as a flattened
 * style.  This is analagous to the flatten routine that is part of the style sheet API
 *
 * @param style - StyleProp<TStyle> to flatten, this can be a TStyle or an array
 */
export function flattenStyle<TStyle extends object = object>(style: StyleProp<TStyle>): object;
export function flattenStyle(style: StyleProp<any>): object {
  return Array.isArray(style) ? immutableMerge(...style.map((v) => flattenStyle(v))) : (style as object) || {};
}

/**
 * Merge styles together into a single flat object and optionally finalize them, can also be used to finalize a single style
 *
 * @param styles - array of styles to merge together.  The styles will be flattened as part of the process
 */

// Overload for 2 arguments with potentially different types
export function mergeAndFlattenStyles<T1 extends object, T2 extends object>(
  style1: StyleProp<T1>,
  style2: StyleProp<T2>,
): object | undefined;

// Overload for 3 arguments with potentially different types
export function mergeAndFlattenStyles<T1 extends object, T2 extends object, T3 extends object>(
  style1: StyleProp<T1>,
  style2: StyleProp<T2>,
  style3: StyleProp<T3>,
): object | undefined;

// General fallback for any number of arguments of the same type
export function mergeAndFlattenStyles<TStyle extends object = object>(...styles: StyleProp<TStyle>[]): object | undefined;

// Implementation
export function mergeAndFlattenStyles(...styles: StyleProp<any>[]): object | undefined {
  // baseline merge and flatten the objects
  return immutableMerge(
    ...styles.map((styleProp: StyleProp<any>) => {
      return flattenStyle(styleProp);
    }),
  );
}

const _styleCache = getMemoCache();

/**
 * Function overloads to allow merging styles of different types.
 * This is useful when merging token-based styles with React Native StyleProp types.
 */

// Overload for 1 argument
export function mergeStyles<T1 extends object>(style1: StyleProp<T1>): object | undefined;

// Overload for 2 arguments with potentially different types
export function mergeStyles<T1 extends object, T2 extends object>(
  style1: StyleProp<T1>,
  style2: StyleProp<T2>,
): object | undefined;

// Overload for 3 arguments with potentially different types
export function mergeStyles<T1 extends object, T2 extends object, T3 extends object>(
  style1: StyleProp<T1>,
  style2: StyleProp<T2>,
  style3: StyleProp<T3>,
): object | undefined;

// Overload for 4 arguments with potentially different types
export function mergeStyles<T1 extends object, T2 extends object, T3 extends object, T4 extends object>(
  style1: StyleProp<T1>,
  style2: StyleProp<T2>,
  style3: StyleProp<T3>,
  style4: StyleProp<T4>,
): object | undefined;

// General fallback for any number of arguments of the same type
export function mergeStyles<TStyle extends object = object>(...styles: StyleProp<TStyle>[]): object | undefined;

// Implementation
export function mergeStyles(...styles: StyleProp<any>[]): object | undefined {
  // filter the style set to just objects (which might be arrays or plain style objects)
  const inputs = styles.filter((s) => typeof s === 'object') as object[];

  // now memo the results if there is more than one element or if the one element is an array
  return inputs.length > 1 || (inputs.length === 1 && Array.isArray(inputs[0]))
    ? _styleCache(() => mergeAndFlattenStyles(undefined, ...inputs), inputs)[0]
    : inputs[0] || {};
}
