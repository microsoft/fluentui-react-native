// immutable-merge exports
export { immutableMerge, immutableMergeCore, processImmutable, filterToObjects } from './immutable-merge/Merge';
export type {
  BuiltinRecursionHandlers,
  CustomRecursionHandler,
  MergeOptions,
  ObjectBase,
  RecursionHandler,
  RecursionOption,
} from './immutable-merge/Merge';

// memo-cache exports
export type { GetMemoValue } from './memo-cache/getMemoCache';
export { getMemoCache } from './memo-cache/getMemoCache';
export { memoize } from './memo-cache/memoize';

// merge-props exports
export type { StyleProp } from './merge-props/mergeStyles.types';
export { mergeStyles } from './merge-props/mergeStyles';
export { mergeProps } from './merge-props/mergeProps';
