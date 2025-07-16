import type { MergeOptions } from '../immutable-merge/Merge';
import { immutableMergeCore, filterToObjects } from '../immutable-merge/Merge';

import { mergeStyles } from './mergeStyles';

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
export function mergeProps<TProps>(...props: (TProps | undefined)[]): TProps {
  return immutableMergeCore(mergePropsOptions, ...filterToObjects<TProps>(props));
}
