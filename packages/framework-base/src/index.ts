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
export type { GetMemoValue, GetTypedMemoValue } from './memo-cache/getMemoCache';
export { getMemoCache, getTypedMemoCache } from './memo-cache/getMemoCache';
export { memoize } from './memo-cache/memoize';

// merge-props exports
export type { StyleProp } from './merge-props/mergeStyles.types';
export { mergeStyles } from './merge-props/mergeStyles';
export { mergeProps } from './merge-props/mergeProps';

// component pattern exports
export { renderForJsxRuntime, renderSlot, asDirectComponent } from './component-patterns/render';
export type {
  DirectComponent,
  FunctionComponent,
  LegacyDirectComponent,
  PhasedComponent,
  PhasedRender,
  PropsOf,
  RenderType,
  RenderResult,
  StagedRender,
  ComposableFunction,
  FinalRender,
  SlotFn,
  NativeReactType,
} from './component-patterns/render.types';
export { directComponent } from './component-patterns/directComponent';
export { getPhasedRender, phasedComponent } from './component-patterns/phasedComponent';
export { withSlots } from './component-patterns/withSlots';
export { stagedComponent } from './component-patterns/stagedComponent';
export { jsx, jsxs } from './jsx-runtime';

// general utilities
export { filterProps } from './utilities/filterProps';
export type { PropsFilter } from './utilities/filterProps';
