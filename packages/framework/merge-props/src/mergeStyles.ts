import { immutableMerge } from '@fluentui-react-native/immutable-merge';
import { getMemoCache } from '@fluentui-react-native/memo-cache';

import type { StyleProp } from './mergeStyles.types';

/**
 * Take a react-native style, which may be a recursive array, and return as a flattened
 * style.  This is analagous to the flatten routine that is part of the style sheet API
 *
 * @param style - StyleProp<TStyle> to flatten, this can be a TStyle or an array
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function flattenStyle(style: StyleProp<object>): object {
  return Array.isArray(style) ? immutableMerge(...style.map((v) => flattenStyle(v))) : style || {};
}

/**
 * Merge styles together into a single flat object and optionally finalize them, can also be used to finalize a single style
 *
 * @param styles - array of styles to merge together.  The styles will be flattened as part of the process
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function mergeAndFlattenStyles(...styles: StyleProp<object>[]): object | undefined {
  // baseline merge and flatten the objects
  return immutableMerge(
    // eslint-disable-next-line @typescript-eslint/ban-types
    ...styles.map((styleProp: StyleProp<object>) => {
      return flattenStyle(styleProp);
    }),
  );
}

const _styleCache = getMemoCache();

export function mergeStyles(...styles: StyleProp<unknown>[]): object | undefined {
  // filter the style set to just objects (which might be arrays or plain style objects)
  // eslint-disable-next-line @typescript-eslint/ban-types
  const inputs = styles.filter((s) => typeof s === 'object') as object[];

  // now memo the results if there is more than one element or if the one element is an array
  return inputs.length > 1 || (inputs.length === 1 && Array.isArray(inputs[0]))
    ? _styleCache(() => mergeAndFlattenStyles(undefined, ...inputs), inputs)[0]
    : inputs[0] || {};
}
