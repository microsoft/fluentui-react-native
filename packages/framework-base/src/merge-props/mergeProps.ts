import type { MergeOptions } from '../immutable-merge/Merge.ts';
import { immutableMergeCore, filterToObjects } from '../immutable-merge/Merge.ts';
import type { ObjectMerger } from '../utilities/mergeTypes.ts';

import { mergeStyles } from './mergeStyles.ts';

/**
 * Props will not deeply merge with the exception of a style property.  Also className needs to be handled specially.
 */
const mergePropsOptions: MergeOptions = {
  className: (...names: any[]) => names.filter((v) => v && typeof v === 'string').join(' '),
  style: mergeStyles,
};

/**
 * Merge props together, flattening and merging styles as appropriate
 * @param props - props to merge together
 */
export const mergeProps: ObjectMerger = (...props: unknown[]) => immutableMergeCore(mergePropsOptions, ...filterToObjects(props));
