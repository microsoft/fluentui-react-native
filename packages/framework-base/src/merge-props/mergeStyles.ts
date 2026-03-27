import { immutableMerge } from '../immutable-merge/Merge';
import { getMemoCache } from '../memo-cache/getMemoCache';
import type { StyleMerger } from '../utilities/mergeTypes';

import type { StyleProp } from '../utilities/baseTypes.ts';

/**
 * Take a react-native style, which may be a recursive array, and return as a flattened
 * style.  This is analogous to the flatten routine that is part of the style sheet API
 *
 * @param style - StyleProp<TStyle> to flatten, this can be a TStyle or an array
 * @internal
 */
export function flattenStyle(style: StyleProp<unknown>): object {
  return Array.isArray(style) ? (immutableMerge(...style.map((v) => flattenStyle(v))) as object) : style || {};
}

/**
 * Merge styles together into a single flat object and optionally finalize them, can also be used to finalize a single style
 *
 * @param styles - array of styles to merge together.  The styles will be flattened as part of the process
 */

export const mergeAndFlattenStyles: StyleMerger = (...styles: StyleProp<unknown>[]) => {
  // baseline merge and flatten the objects
  return immutableMerge(
    ...styles.map((styleProp: StyleProp<unknown>) => {
      return flattenStyle(styleProp);
    }),
  );
};

const _styleCache = getMemoCache();

/**
 * Function overloads to allow merging styles of different types.
 * This is useful when merging token-based styles with React Native StyleProp types.
 */
export const mergeStyles: StyleMerger = (...styles: StyleProp<unknown>[]) => {
  // filter the style set to just objects (which might be arrays or plain style objects)
  const inputs = styles.filter((s) => s !== null && typeof s === 'object');

  // now memo the results if there is more than one element or if the one element is an array
  return inputs.length > 1 || (inputs.length === 1 && Array.isArray(inputs[0]))
    ? _styleCache(() => mergeAndFlattenStyles(undefined, ...inputs), inputs)[0]
    : inputs[0] || {};
};
