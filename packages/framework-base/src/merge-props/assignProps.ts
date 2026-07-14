import type { StyleProp } from 'react-native';
import { isObject } from '../utilities/typeUtils';

/**
 * This will combine multiple styles together. Instead of fully flattening it will keep the style objects intact but build them
 * up into a single flat array with all the individual style values.
 * @param base the base style prop to start with, if this is an array, elements will be added to that array, otherwise a new array will be created
 * @param styles the additional style props to combine with the base style, can be arrays or individual style objects
 * @returns the combined style prop, which will in most cases be an array containing all the individual style values from the base and additional styles
 */
export function assignStyles(...styles: StyleProp<unknown>[]): StyleProp<unknown> {
  const toApply: StyleProp<unknown>[] = styles.filter(Boolean);
  if (toApply.length === 0) {
    return undefined;
  } else if (toApply.length === 1) {
    return toApply[0];
  }
  return assignStylesWorker([], toApply);
}

/**
 * This function merges props together with the same use pattern as Object.assign, except that it will ensure
 * styles get merged rather than replaced.
 *
 * @param base The base props object to start with. This will be the object that receives the merged properties.
 * @param rest Additional props objects whose properties will be merged into the base object.
 * @returns The resulting props object with all properties from the base and additional props merged together.
 */
export function assignProps<TProps>(base: TProps, ...rest: Partial<TProps>[]): TProps {
  // get the base object to add values to
  const result = isObject(base) ? base : {};

  // collect all styles that will need merging, and do the merge upfront
  const stylesToMerge = [getStyle(base), ...rest.map((props) => getStyle(props))].filter(Boolean);
  const style = assignStyles(...stylesToMerge);
  if (style) {
    // if we have a merged style, add it to the rest of the props so it will be included in the final Object.assign
    rest.push({ style } as unknown as Partial<TProps>);
  }
  // finally, assign all the rest of the props to the result object
  return trimUndefinedKeys(Object.assign(result, ...rest));
}

/**
 * Extracts the style property from a props object if it exists.
 *
 * @param props The props object to extract the style from.
 * @returns The style property if it exists, otherwise undefined.
 */
function getStyle(props: unknown): StyleProp<unknown> | undefined {
  if (isObject(props) && 'style' in props) {
    return (props as { style?: StyleProp<unknown> }).style;
  }
  return undefined;
}

/**
 * Recursively collects style objects into a single array, preserving the structure of nested arrays.
 *
 * @param collector The array that collects individual style objects.
 * @param styles The style prop to process, which can be an array or a single style object.
 * @returns The collector array containing all individual style objects.
 */
function assignStylesWorker(collector: StyleProp<unknown>[], styles: StyleProp<unknown>): StyleProp<unknown> {
  if (styles) {
    if (Array.isArray(styles)) {
      for (const style of styles) {
        assignStylesWorker(collector, style);
      }
    } else {
      collector.push(styles);
    }
  }
  return collector;
}

/**
 * Remove all keys with undefined values from the given object.
 * @param obj The object from which undefined keys should be removed.
 * @returns The same object with all undefined keys removed.
 */
export function trimUndefinedKeys<T>(obj: T): T {
  if (isObject(obj)) {
    for (const key in obj) {
      if (obj[key] === undefined) {
        delete obj[key];
      }
    }
  }
  return obj;
}
