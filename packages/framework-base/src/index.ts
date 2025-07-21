// immutable-merge exports
export { immutableMerge, immutableMergeCore, processImmutable, filterToObjects } from './immutable-merge/Merge';
export type {
  BuiltinRecursionHandlers,
  CustomRecursionHandler,
  MergeOptions,
  RecursionHandler,
  RecursionOption,
} from './immutable-merge/Merge';

// memo-cache exports
export type { AnyGetMemoValue, GetMemoValue, GetTypedMemoValue, MemoResult, TypedMemoResult } from './memo-cache/getMemoCache';
export { asGenericMemoCache, asTypedMemoCache, getMemoCache, getTypedMemoCache } from './memo-cache/getMemoCache';
export { memoize } from './memo-cache/memoize';

// merge-props exports
export type { StyleProp } from './merge-props/mergeStyles.types';
export { mergeStyles } from './merge-props/mergeStyles';
export { mergeProps } from './merge-props/mergeProps';

export type {
  AnyFunction,
  EnhancedTypeof,
  NativeReactElement,
  ObjectBase,
  PropsBase,
  PropsNoChildrenBase,
  PropsWithChildrenBase,
  TypeofResult,
  UnknownObject,
} from './types';
export { enhancedTypeof } from './typeUtilities';

// component pattern exports
export { renderSlot } from './component-patterns/renderSlot';
export type { SlotFn, NativeReactType } from './component-patterns/renderSlot';
export { withSlots } from './component-patterns/withSlots';
export { stagedComponent } from './component-patterns/stagedComponent';
export type { FinalRender, StagedRender, ComposableFunction } from './component-patterns/stagedComponent';

// transformer exports

// jsx-runtime exports
export { jsx, jsxs, Fragment } from './jsx-runtime';
