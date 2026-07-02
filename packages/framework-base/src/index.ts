/**
 * ----- IMMUTABLE MERGE -----
 */

export { immutableMerge, immutableMergeCore, processImmutable, filterToObjects } from './immutable-merge/Merge.ts';
export type {
  BuiltinRecursionHandlers,
  CustomRecursionHandler,
  MergeOptions,
  RecursionHandler,
  RecursionOption,
} from './immutable-merge/Merge.ts';

/**
 * ----- MEMO CACHE -----
 */
export type { GetMemoValue, GetTypedMemoValue } from './memo-cache/getMemoCache.ts';
export { getMemoCache, getTypedMemoCache } from './memo-cache/getMemoCache.ts';
export { memoize } from './memo-cache/memoize.ts';

/**
 * ----- MERGE PROPS / MERGE STYLES -----
 */
export { mergeStyles } from './merge-props/mergeStyles.ts';
export { mergeProps } from './merge-props/mergeProps.ts';

/**
 * ----- COMPONENT PATTERNS -----
 */

export { renderSlot, createSlotComponent } from './component-patterns/render.ts';
export { directComponent, isDirectComponent, legacyDirectComponent, isLegacyDirectComponent } from './component-patterns/direct.ts';
export { phasedComponent, isPhasedComponent, stagedComponent, isStagedComponent } from './component-patterns/phased.ts';
export { useSlot, useOptionalSlot } from './component-patterns/useSlot.ts';

// legacy JSX handler
export { withSlots } from './component-patterns/withSlots.tsx';

/**
 * ----- JSX RUNTIME -----
 */
export { jsx, jsxs } from './jsx-runtime.ts';
export type { FurnJSX } from './types/react.types.ts';

/**
 * ----- UTILITIES -----
 */
export { filterProps, propTransformFromFilter } from './utilities/filterProps.ts';
export { extractChildren, extractProps, extractStyle } from './utilities/extract.ts';
export { getPropsChildren, isObject, splitPropsAndChildren, getEntityType } from './utilities/typeUtils.ts';
export type { ExpandedTypeof, TypeofResult } from './utilities/typeUtils.ts';

/**
 * ------- TYPES --------
 */

export type {
  StyleProp,
  ObjectBase,
  ObjectFallback,
  ObjectMerger,
  ObjectMergerWithOptions,
  StyleMerger,
  PropsFilter,
  PropsOf,
  PropsWithoutChildren,
  PropsWithoutRef,
} from './types/props.types.ts';
export type {
  DirectComponent,
  FunctionComponent,
  LegacyDirectComponent,
  LegacyFunctionComponent,
  PhasedComponent,
  PhasedRender,
  StagedComponent,
  StagedRender,
  RenderType,
  RenderResult,
  SlotComponent,
} from './types/render.types.ts';
export type {
  DistributiveOmit,
  DistributivePick,
  UnionToIntersection,
  ReplaceNullWithUndefined,
  IsSingleton,
} from './types/utility.types.ts';
