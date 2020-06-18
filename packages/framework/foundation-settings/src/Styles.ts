import { immutableMerge } from '@uifabricshared/immutable-merge';
import { IFinalizeStyle, IStyleProp } from './Styles.types';
import { getMemoCache } from '@fluentui-react-native/memo-cache';

/**
 * Take a react-native style, which may be a recursive array, and return as a flattened
 * style.  This is analagous to the flatten routine that is part of the style sheet API
 *
 * @param style - StyleProp<TStyle> to flatten, this can be a TStyle or an array
 */
export function flattenStyle(style: IStyleProp<object>): object {
  if (style === null || typeof style !== 'object') {
    return {};
  }

  if (!Array.isArray(style)) {
    return style;
  }
  return immutableMerge(...style.map(v => flattenStyle(v)));
}

/**
 * Merge styles together into a single flat object and optionally finalize them, can also be used to finalize a single style
 *
 * @param styles - array of styles to merge together.  The styles will be flattened as part of the process
 */
export function mergeAndFlattenStyles(finalizer: IFinalizeStyle | undefined, ...styles: IStyleProp<object>[]): object | undefined {
  // baseline merge and flatten the objects
  let merged = immutableMerge(
    ...styles.map((styleProp: IStyleProp<object>) => {
      return flattenStyle(styleProp);
    })
  );

  // if the styles should be finalized as part of this do that as well
  if (finalizer && merged) {
    const updated = finalizer(merged);
    if (updated && Object.keys(updated).length > 0) {
      merged = immutableMerge(merged, updated);
    }
  }

  return merged;
}

const _styleCache = getMemoCache();

export function memoAndMergeStyles(...styles: IStyleProp<object>[]): object | undefined {
  // filter the style set to just objects (which might be arrays or plain style objects)
  const inputs = styles.filter(s => typeof s === 'object') as object[];

  // now memo the results if there is more than one element or if the one element is an array
  return inputs.length > 1 || (inputs.length === 1 && Array.isArray(inputs[0]))
    ? _styleCache(() => mergeAndFlattenStyles(undefined, ...inputs), inputs)[0]
    : inputs[0] || {};
}
