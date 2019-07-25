import { StyleProp } from 'react-native';
import { immutableMerge } from './Merge';
import { ITheme } from './Theme.types';
import { IStyleValueFinalizers } from './Styles.types';

/**
 * Take a react-native style, which may be a recursive array, and return as a flattened
 * style.  This is analagous to the flatten routine that is part of the style sheet API
 *
 * @param style - StyleProp<TStyle> to flatten, this can be a TStyle or an array
 */
export function flattenStyle(style: StyleProp<object>): object {
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
export function mergeAndFinalizeStyles(
  theme: ITheme | undefined,
  finalizers: IStyleValueFinalizers | undefined,
  ...styles: StyleProp<object>[]
): object | undefined {
  // baseline merge and flatten the objects
  let merged = immutableMerge(
    {},
    ...styles.map((styleProp: StyleProp<object>) => {
      return flattenStyle(styleProp);
    })
  );

  // if the styles should be finalized as part of this do that as well
  if (theme && finalizers && merged) {
    const updated = {};
    for (const key in merged) {
      if (merged.hasOwnProperty(key) && finalizers[key]) {
        finalizers[key](theme, merged, key, updated);
      }
    }
    if (Object.keys(updated).length > 0) {
      merged = immutableMerge({}, merged, updated);
    }
  }

  return merged;
}

/**
 * A finalizer that will simply strip a key from a style if it is found
 */
export function stripKey(_theme: ITheme, style: object, key: string, target: object): void {
  if (style.hasOwnProperty(key)) {
    target[key] = undefined;
  }
}

export function finalizeSemanticValue<TContainer>(container: TContainer, style: object, key: string, target: object): void {
  const value = style[key];
  if (value && container[value]) {
    target[key] = container[value];
  }
}

/**
 * Replace a color value with a value from the palette if it resolves
 */
export function finalizeColor(theme: ITheme, style: object, key: string, target: object): void {
  return finalizeSemanticValue(theme.palette, style, key, target);
}

/**
 * Update font family with a semantic value if it resolves
 */
export function finalizeFontFamily(theme: ITheme, style: object, key: string, target: object): void {
  return finalizeSemanticValue(theme.typography.families, style, key, target);
}

/**
 * Update the font size with a semantic value if it resolves
 */
export function finalizeFontSize(theme: ITheme, style: object, key: string, target: object): void {
  return finalizeSemanticValue(theme.typography.sizes, style, key, target);
}

/**
 * Update the font weight with a semantic value if it resolves
 */
export function finalizeFontWeight(theme: ITheme, style: object, key: string, target: object): void {
  return finalizeSemanticValue(theme.typography.weights, style, key, target);
}
