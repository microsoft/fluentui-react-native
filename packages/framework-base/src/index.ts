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
export { renderForClassicRuntime, renderForJsxRuntime, renderSlot } from './component-patterns/render';
export type {
  DirectComponent,
  DirectComponentFunction,
  LegacyDirectComponent,
  StagedComponent,
  StagedRender,
  TwoStageRender,
  RenderType,
  RenderResult,
  ComposableFunction,
  FinalRender,
  SlotFn,
  NativeReactType,
} from './component-patterns/render.types';
export { withSlots } from './component-patterns/withSlots';
export { stagedComponent, twoStageComponent } from './component-patterns/stagedComponent';
export { jsx, jsxs } from './jsx-runtime';
