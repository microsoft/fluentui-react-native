import { immutableMerge } from '../immutable-merge/Merge';
import { getMemoCache } from '../memo-cache/getMemoCache';

import type { StyleProp } from './mergeStyles.types';

/**
 * Take a react-native style, which may be a recursive array, and return as a flattened
 * style.  This is analagous to the flatten routine that is part of the style sheet API
 *
 * @param style - StyleProp<TStyle> to flatten, this can be a TStyle or an array
 */
export function flattenStyle<T extends object>(style: StyleProp<T>): T {
  return Array.isArray(style) ? immutableMerge<T>(...style.map((v) => flattenStyle(v))) : ((style || {}) as T);
}

/**
 * Merge styles together into a single flat object and optionally finalize them, can also be used to finalize a single style
 *
 * @param styles - array of styles to merge together.  The styles will be flattened as part of the process
 */
export function mergeAndFlattenStyles<T extends object>(...styles: StyleProp<object>[]): T | undefined {
  // baseline merge and flatten the objects
  return immutableMerge(
    ...styles.map((styleProp: StyleProp<object>) => {
      return flattenStyle(styleProp);
    }),
  ) as T;
}

const _styleCache = getMemoCache();

/**
 * Function overloads to allow merging of styles of different types
 */
export function mergeStyles<T extends object = object>(...styles: StyleProp<object>[]): T | undefined {
  // filter the style set to just objects (which might be arrays or plain style objects)
  const inputs = styles.filter((s) => typeof s === 'object') as object[];

  // now memo the results if there is more than one element or if the one element is an array
  return inputs.length > 1 || (inputs.length === 1 && Array.isArray(inputs[0]))
    ? _styleCache(() => mergeAndFlattenStyles<T>(undefined, ...inputs), inputs)[0]
    : ((inputs[0] || {}) as T);
}
