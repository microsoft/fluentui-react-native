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

// component pattern exports - extracting from elements
export { extractChildren, extractProps, extractStyle } from './component-patterns/extract';

// component pattern exports - rendering utilities
export { renderForJsxRuntime, renderSlot, asDirectComponent } from './component-patterns/render';

// component pattern exports - core types
export type {
  DirectComponent,
  FunctionComponent,
  FunctionComponentCore,
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

// component pattern exports - component builders
export { directComponent } from './component-patterns/directComponent';
export { getPhasedRender, phasedComponent } from './component-patterns/phasedComponent';
export { stagedComponent } from './component-patterns/stagedComponent';

// component pattern exports - legacy JSX handlers
export { withSlots } from './component-patterns/withSlots';

// jsx runtime exports
export { jsx, jsxs } from './jsx-runtime';

// general utilities
export { filterProps } from './utilities/filterProps';
export type { PropsFilter } from './utilities/filterProps';
