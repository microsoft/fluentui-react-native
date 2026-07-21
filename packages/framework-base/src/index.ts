/**
 * ----- IMMUTABLE MERGE -----
 */

export { immutableMerge, immutableMergeCore, processImmutable, filterToObjects } from './immutable-merge/Merge';
export type {
  BuiltinRecursionHandlers,
  CustomRecursionHandler,
  MergeOptions,
  RecursionHandler,
  RecursionOption,
} from './immutable-merge/Merge';

/**
 * ----- MEMO CACHE -----
 */
export type { GetMemoValue, GetTypedMemoValue } from './memo-cache/getMemoCache';
export { getMemoCache, getTypedMemoCache } from './memo-cache/getMemoCache';
export { memoize } from './memo-cache/memoize';

/**
 * ----- MERGE PROPS / MERGE STYLES -----
 */
export { mergeStyles } from './merge-props/mergeStyles';
export { mergeProps } from './merge-props/mergeProps';
export { assignProps, assignStyles } from './merge-props/assignProps';

/**
 * ----- COMPONENT PATTERNS -----
 */

export { renderSlot, createSlotComponent, renderJsx } from './component-patterns/render';
export { directComponent, legacyDirectComponent } from './component-patterns/direct';
export { phasedComponent, stagedComponent } from './component-patterns/phased';
export { attachSlotProps } from './component-patterns/slot';
export { useSlot, useOptionalSlot } from './component-patterns/useSlot';
export {
  isDirectComponentType,
  isSlotComponent,
  isDirectComponent,
  isLegacyDirectComponent,
  isStagedComponent,
  isPhasedComponent,
} from './component-patterns/identify';

// legacy JSX handler
export { withSlots } from './component-patterns/withSlots';

/**
 * ----- HOOKS -----
 */
export { usePressableState } from './hooks/usePressableState';
export type { UsePressableResult } from './hooks/usePressableState';
export type { PressableState, PressableStateKeys } from './types/interactive.types';

/**
 * ----- JSX RUNTIME -----
 */
export { jsx, jsxs } from './jsx-runtime';
export type { FurnJSX } from './types/react.types';

/**
 * ----- UTILITIES -----
 */
export { filterProps, propTransformFromFilter } from './utilities/filterProps';
export { extractChildren, extractProps, extractStyle } from './utilities/extract';
export { getPropsChildren, isObject, setPropsChildren, splitPropsAndChildren, getEntityType } from './utilities/typeUtils';
export { normalizeChildren, reconcileChildren, getChildrenAsArray, getSingleChild } from './utilities/children';
export type { ExpandedTypeof, TypeofResult } from './utilities/typeUtils';

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
} from './types/props.types';
export type {
  DirectComponent,
  FunctionComponent,
  LegacyDirectComponent,
  LegacyFunctionComponent,
  PhasedComponent,
  PhasedRender,
  StagedComponent,
  StagedRender,
  PropsTransform,
  RenderType,
  RenderResult,
  SlotComponent,
} from './types/render.types';
export type { DistributiveOmit, DistributivePick, UnionToIntersection, ReplaceNullWithUndefined, IsSingleton } from './types/utility.types';
