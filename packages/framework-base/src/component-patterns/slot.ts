import React from 'react';
import type { SlotComponent } from '../types/render.types';
import { SLOT_COMPONENT_KEY, SLOT_PROPS_KEY, SLOT_PROP_TRANSFORM_KEY } from '../const';
import { mergeProps } from '../merge-props/mergeProps';
import { assignProps } from '../merge-props/assignProps';

type SlotRef = React.Ref<unknown>;
type RefCleanup = void | (() => void);
type MergedRefCache = WeakMap<object, WeakMap<object, React.RefCallback<unknown>>>;

const mergedRefCaches = new WeakMap<object, MergedRefCache>();
const supportsRefCleanup = Number.parseInt(React.version, 10) >= 19;

function getPropsRef(props: unknown): SlotRef | undefined {
  return props != null && typeof props === 'object' && 'ref' in props ? (props as { ref?: SlotRef }).ref : undefined;
}

function isUsableRef(ref: SlotRef | undefined): ref is Exclude<SlotRef, null> {
  return typeof ref === 'function' || (typeof ref === 'object' && ref !== null);
}

function setRef(ref: Exclude<SlotRef, null>, value: unknown | null): RefCleanup {
  if (typeof ref === 'function') {
    const cleanup = ref(value);
    return typeof cleanup === 'function' ? cleanup : undefined;
  }
  (ref as React.MutableRefObject<unknown | null>).current = value;
}

function createMergedRef(first: Exclude<SlotRef, null>, second: Exclude<SlotRef, null>): React.RefCallback<unknown> {
  return (value) => {
    if (value == null) {
      setRef(first, null);
      setRef(second, null);
      return;
    }

    const firstCleanup = setRef(first, value);
    const secondCleanup = setRef(second, value);
    if (!supportsRefCleanup) {
      return;
    }
    return () => {
      typeof firstCleanup === 'function' ? firstCleanup() : setRef(first, null);
      typeof secondCleanup === 'function' ? secondCleanup() : setRef(second, null);
    };
  };
}

function mergeSlotRefs(
  slotInfo: object,
  first: Exclude<SlotRef, null>,
  second: Exclude<SlotRef, null>,
): React.RefCallback<unknown> | Exclude<SlotRef, null> {
  if (first === second) {
    return first;
  }

  let firstRefs = mergedRefCaches.get(slotInfo);
  if (firstRefs === undefined) {
    firstRefs = new WeakMap();
    mergedRefCaches.set(slotInfo, firstRefs);
  }

  let secondRefs = firstRefs.get(first);
  if (secondRefs === undefined) {
    secondRefs = new WeakMap();
    firstRefs.set(first, secondRefs);
  }

  let mergedRef = secondRefs.get(second);
  if (mergedRef === undefined) {
    mergedRef = createMergedRef(first, second);
    secondRefs.set(second, mergedRef);
  }
  return mergedRef;
}

/**
 * Convenience type, just referencing the statics of the component
 */
export type SlotComponentStatics<TProps> = Pick<
  SlotComponent<TProps>,
  typeof SLOT_COMPONENT_KEY | typeof SLOT_PROPS_KEY | typeof SLOT_PROP_TRANSFORM_KEY | 'displayName'
>;

/**
 * Set the slot statics for a new component, or to re-use an existing component
 * @param statics - The statics object to update.
 * @param component - The component to set as the slot component.
 * @param props - The base props for the slot component.
 * @param options - Optional settings for creating the slot.
 */
export function setSlotStatics<TProps>(
  statics: Partial<SlotComponentStatics<TProps>>,
  component: React.ComponentType<TProps>,
  props: Partial<TProps>,
  transform?: (props: TProps) => TProps,
): SlotComponentStatics<TProps> {
  statics[SLOT_COMPONENT_KEY] = component;
  statics[SLOT_PROPS_KEY] = props;
  statics[SLOT_PROP_TRANSFORM_KEY] = transform;
  if (component.displayName) {
    statics.displayName = component.displayName;
  }
  return statics as SlotComponentStatics<TProps>;
}

/**
 * Given a set of userProps, prepare the final props for a slot component
 * - merging with base props
 * - running the transform if present
 */
export function prepareSlotProps<TProps>(slotInfo: SlotComponentStatics<TProps>, userProps?: TProps): TProps {
  const baseProps = slotInfo[SLOT_PROPS_KEY];
  const transform = slotInfo[SLOT_PROP_TRANSFORM_KEY];
  const baseRef = getPropsRef(baseProps);
  const userRef = getPropsRef(userProps);
  let mergedProps = mergeProps<TProps>(baseProps, userProps) ?? ({} as TProps);
  if (isUsableRef(baseRef) && isUsableRef(userRef)) {
    mergedProps = { ...mergedProps, ref: mergeSlotRefs(slotInfo, baseRef, userRef) };
  }
  if (!transform) {
    return mergedProps;
  }

  let transformedProps = transform(mergedProps);
  const mergedRef = getPropsRef(mergedProps);
  const transformedRef = getPropsRef(transformedProps);
  if (isUsableRef(mergedRef) && transformedRef !== mergedRef) {
    transformedProps = {
      ...transformedProps,
      ref: isUsableRef(transformedRef) ? mergeSlotRefs(slotInfo, mergedRef, transformedRef) : mergedRef,
    };
  }
  return transformedProps;
}

/**
 * Attach the given props to the slot component statics object, merging them with any existing props.
 * @param slot The slot component statics object to attach props to.
 * @param props The props to attach to the slot component.
 */
export function attachSlotProps<TProps>(slot: SlotComponentStatics<TProps>, props: TProps): void {
  slot[SLOT_PROPS_KEY] = assignProps((slot[SLOT_PROPS_KEY] ?? {}) as TProps, props);
}
