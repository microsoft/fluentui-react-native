import { immutableMerge } from '@uifabric/immutable-merge';
import { IFinalizeStyle, IStyleProp } from './Styles.types';

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

  const result = {};
  for (let i = 0, styleLength = style.length; i < styleLength; ++i) {
    Object.assign(result, flattenStyle(style[i]));
  }
  return result;
}

/**
 * Merge styles together into a single flat object and optionally finalize them, can also be used to finalize a single style
 *
 * @param styles - array of styles to merge together.  The styles will be flattened as part of the process
 */
export function mergeAndFinalizeStyles(finalizer: IFinalizeStyle | undefined, ...styles: IStyleProp<object>[]): object | undefined {
  // baseline merge and flatten the objects
  let merged = immutableMerge(
    {},
    ...styles.map((styleProp: IStyleProp<object>) => {
      return flattenStyle(styleProp);
    })
  );

  // if the styles should be finalized as part of this do that as well
  if (finalizer && merged) {
    const updated = finalizer(merged);
    if (updated && Object.keys(updated).length > 0) {
      merged = immutableMerge({}, merged, updated);
    }
  }

  return merged;
}
