import { immutableMerge } from '../immutable-merge/Merge';
import { getMemoCache } from '../memo-cache/getMemoCache';
import type { ObjectBase } from '../types';

import type { StyleProp } from './mergeStyles.types';
import { isNonEmptyType, isType } from '../typeUtilities';

/**
 * Take a react-native style, which may be a recursive array, and return as a flattened
 * style.  This is analagous to the flatten routine that is part of the style sheet API
 *
 * @param style - StyleProp<TStyle> to flatten, this can be a TStyle or an array
 */
export function flattenStyle(style: StyleProp<ObjectBase>): Record<string, unknown> {
  return Array.isArray(style) ? immutableMerge(...style.map((v) => flattenStyle(v))) : style || {};
}

/**
 * Merge styles together into a single flat object and optionally finalize them, can also be used to finalize a single style
 *
 * @param styles - array of styles to merge together.  The styles will be flattened as part of the process
 */
export function mergeAndFlattenStyles(...styles: StyleProp<ObjectBase>[]): Record<string, unknown> | undefined {
  // baseline merge and flatten the objects
  return immutableMerge(
    ...styles.map((styleProp: StyleProp<ObjectBase>) => {
      return flattenStyle(styleProp);
    }),
  );
}

const _styleCache = getMemoCache();

export function mergeStyles(...styles: StyleProp<ObjectBase>[]): Record<string, unknown> | undefined {
  // filter the style set to just objects (which might be arrays or plain style objects)
  const inputs = styles.filter((s) => isNonEmptyType(s, ['object', 'array'])).map((s) => (isType(s, 'array') ? flattenStyle(s) : s));

  // now memo the results if there is more than one element or if the one element is an array
  return inputs.length > 1 || (inputs.length === 1 && Array.isArray(inputs[0]))
    ? _styleCache(() => mergeAndFlattenStyles(undefined, ...inputs), inputs)[0]
    : inputs[0] || {};
}
