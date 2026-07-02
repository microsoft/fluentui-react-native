import type { MergeOptions } from '../immutable-merge/Merge';
import { immutableMergeCore, filterToObjects } from '../immutable-merge/Merge';
import type { ObjectMerger } from '../types/props.types';

import { mergeStyles } from './mergeStyles';

/**
 * Props will not deeply merge with the exception of a style property.  Also className needs to be handled specially.
 */
const mergePropsOptions: MergeOptions = {
  className: (...names: any[]) => names.filter((v) => v && typeof v === 'string').join(' '),
  style: mergeStyles,
  // children follow last-wins semantics, but a null (or undefined) child must not clobber a real child value
  // supplied elsewhere in the merge. Pick the last defined (non-null, non-undefined) value instead.
  children: (...values: any[]) => {
    let merged: unknown = undefined;
    for (const value of values) {
      if (value !== null && value !== undefined) {
        merged = value;
      }
    }
    return merged;
  },
};

/**
 * Merge props together, flattening and merging styles as appropriate
 * @param props - props to merge together
 */
export const mergeProps: ObjectMerger = (...props: unknown[]) => immutableMergeCore(mergePropsOptions, ...filterToObjects(props));
