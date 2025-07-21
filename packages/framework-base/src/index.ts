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

// component pattern exports
export { renderSlot } from './component-patterns/renderSlot';
export type { SlotFn, NativeReactType } from './component-patterns/renderSlot';
export { withSlots } from './component-patterns/withSlots';
export { stagedComponent } from './component-patterns/stagedComponent';
export type { FinalRender, StagedRender, ComposableFunction } from './component-patterns/stagedComponent';
