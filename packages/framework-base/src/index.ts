// immutable-merge exports
export { immutableMerge, immutableMergeCore, processImmutable, filterToObjects } from './immutable-merge/Merge.ts';
export type {
  BuiltinRecursionHandlers,
  CustomRecursionHandler,
  MergeOptions,
  ObjectBase,
  RecursionHandler,
  RecursionOption,
} from './immutable-merge/Merge.ts';

// memo-cache exports
export type { GetMemoValue, GetTypedMemoValue } from './memo-cache/getMemoCache.ts';
export { getMemoCache, getTypedMemoCache } from './memo-cache/getMemoCache.ts';
export { memoize } from './memo-cache/memoize.ts';

// merge-props exports
export type { StyleProp } from './merge-props/mergeStyles.types.ts';
export { mergeStyles } from './merge-props/mergeStyles.ts';
export { mergeProps } from './merge-props/mergeProps.ts';

// component pattern exports - extracting from elements
export { extractChildren, extractProps, extractStyle } from './component-patterns/extract.ts';

// component pattern exports - rendering utilities
export { renderForJsxRuntime, renderSlot, asDirectComponent } from './component-patterns/render.ts';

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
} from './component-patterns/render.types.ts';

// component pattern exports - component builders
export { directComponent } from './component-patterns/directComponent.ts';
export { getPhasedRender, phasedComponent } from './component-patterns/phasedComponent.ts';
export { stagedComponent } from './component-patterns/stagedComponent.ts';

// component pattern exports - legacy JSX handlers
export { withSlots } from './component-patterns/withSlots.ts';

// jsx runtime exports
export { jsx, jsxs } from './jsx-runtime.ts';
export type { FurnJSX } from './jsx-namespace.ts';

// general utilities
export { filterProps } from './utilities/filterProps.ts';
export type { PropsFilter } from './utilities/filterProps.ts';
