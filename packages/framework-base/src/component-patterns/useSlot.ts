import * as React from 'react';

import type { SlotComponent, UseSlot, UseOptionalSlot, PropsTransform } from '../types/render.types';
import { setSlotStatics } from './slot';
import { createSlotComponent } from './render';
import { isPhasedComponent, isSlotShorthandValue, isStagedComponent } from './identify';
import { SLOT_COMPONENT_KEY } from '../const';
import { prepareStagedProps } from './phased';
import type { SlotShorthandValue } from '../types/component.types';
import { mergeProps } from '../merge-props/mergeProps';
import { isObject } from '../utilities/typeUtils';

/**
 * The core useSlot hook implementation, while the return result will always be a SlotComponent, the implementation will fork
 * based on whether the component implements special rendering patterns.
 *
 * - component: Standard component (View, Text, function, class, etc.)
 *      This will create a slot, with the options and initial props configured, with the type as the base type.
 *      On render, any props added via jsx will be merged with the initial props, and our internal jsx runtime will render it
 *      directly. In essence if this slot is of type View that is what will appear in the render tree.
 *
 * - component: Direct component (created via one of our internal patterns)
 *      This will do all the work mentioned above, but when rendered via our internal runtime, it will call the function
 *      directly. E.g.: if component is a custom direct component called MyWrapper that itself contains a View, MyWrapper will
 *      be omitted from the render tree and only the View will be rendered.
 *
 * - component: Phased/Staged component
 *      In this case, the component implements a phased render pattern and since this function is itself a hook, we can deterministically call the
 *      inner hook component to get to the inner element. This effectively extends the direct component patterns to work with hooks as
 *      well. Allowing things like picking up context for theming without having to create unnecessary wrapper layers.
 *
 * @param component - any kind of component that can be rendered as part of the tree
 * @param hookProps - props, either full or partial that should be embedded in the component
 * @param transform - an optional transform function for filtering props or doing other last minute transitions
 */
export const useSlot: UseSlot = <TProps>(
  component: React.ComponentType<TProps>,
  hookProps: Partial<TProps> = {},
  transform?: PropsTransform<TProps>,
): SlotComponent<TProps> => {
  // handle the component being a phased/staged render
  if (isPhasedComponent<TProps>(component)) {
    // phased components can pass through children given that it is carried along with the props
    component = component[SLOT_COMPONENT_KEY](hookProps);
    hookProps = {};
  } else if (isStagedComponent<TProps>(component)) {
    [component, hookProps] = prepareStagedProps(component[SLOT_COMPONENT_KEY], hookProps as TProps);
  }
  // now onto the slot creation itself, use a ref to get per-instance storage for the slot
  const slotRef = React.useRef<SlotComponent<TProps> | null>(null);
  if (slotRef.current == null) {
    slotRef.current = createSlotComponent<TProps>(component, hookProps, transform);
  } else {
    // update the existing slot with new props and transform if necessary
    setSlotStatics(slotRef.current, component, hookProps, transform);
  }
  return slotRef.current;
};

/**
 * The optional slot pattern effectively handles having a null or undefined component type passed in
 * and handles that changing at runtime.
 *
 * To not violate the rule of hooks this does not resolve staged/phased components, instead using their standard entry
 * point for when they aren't resolved early.
 *
 * @param component - react component type which may or may not be specified
 * @param hookProps - props to be passed to the component
 * @param transform - an optional transform function for filtering props or doing other last minute transitions
 * @returns The slot component if the component is defined, otherwise null
 */
export const useOptionalSlot: UseOptionalSlot = <TProps>(
  component: React.ComponentType<TProps> | undefined | null,
  hookProps: Partial<TProps> = {},
  transform?: PropsTransform<TProps>,
): SlotComponent<TProps> | undefined => {
  // just create the hook itself
  const slotRef = React.useRef<SlotComponent<TProps> | undefined>(undefined);
  if (component != null) {
    if (slotRef.current == null) {
      slotRef.current = createSlotComponent<TProps>(component, hookProps, transform);
    } else {
      // update the existing slot with new props and transform if necessary
      setSlotStatics(slotRef.current, component, hookProps, transform);
    }
  } else {
    slotRef.current = undefined;
  }
  return slotRef.current;
};

/**
 * Create a slot from a slot prop, which can include prop overrides, a component type override, or a shorthand value
 * which is routed to the children prop of the slot.
 *
 * @param prop the slot prop, which can be a component, shorthand value, or null/undefined
 * @param baseComponent the base component to use if the prop does not specify one
 * @param baseProps the base props to merge with the prop's props
 * @returns a slot component with the resolved component and props
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function useSlotProp<Props extends {}>(
  prop: Props | SlotShorthandValue | null | undefined,
  baseComponent: React.ComponentType,
  baseProps: Partial<Props> = {},
): SlotComponent<Partial<Props>> {
  return useSlot(...resolveSlotProps(prop, baseComponent, baseProps));
}

/**
 * Create an optional slot from a slot prop, which can include prop overrides, a component type override, or a shorthand value
 * which is routed to the children prop of the slot. If the component is null or undefined, and no component type is specified
 * in the prop parameter the slot will be undefined.
 * @param prop the value of the slot prop, which can be a component, shorthand value, or null/undefined
 * @param baseComponent the base component to use if the prop does not specify one
 * @param baseProps the base props to merge with the prop's props
 * @returns a slot component with the resolved component and props, or undefined if no component is specified
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function useOptionalSlotProp<Props extends {}>(
  prop: Props | SlotShorthandValue | null | undefined,
  baseComponent: React.ComponentType,
  baseProps: Partial<Props> = {},
): SlotComponent<Partial<Props>> | undefined {
  const [component, props] = resolveSlotProps(prop, baseComponent, baseProps);
  return useOptionalSlot(prop == null ? undefined : component, props);
}

/**
 * Resolves the final component and props for a slot.
 * @param prop The slot prop, which can be a component, shorthand value, or null/undefined.
 * @param baseComponent The base component to use if the prop does not specify one.
 * @param baseProps The base props to merge with the prop's props.
 * @returns A tuple containing the resolved component and props.
 */
function resolveSlotProps<Props>(
  prop: Props | SlotShorthandValue | null | undefined,
  baseComponent: React.ComponentType,
  baseProps: Partial<Props> = {},
): [React.ComponentType, Props] {
  if (prop != null) {
    if (isSlotShorthandValue(prop)) {
      baseProps = { ...baseProps, children: prop };
    } else if (isObject(prop)) {
      const { as, ...userProps } = prop as { as?: React.ComponentType };
      if (as != null) {
        baseComponent = as;
      }
      if (userProps != null && Object.keys(userProps).length > 0) {
        baseProps = mergeProps(baseProps, userProps);
      }
    }
  }
  return [baseComponent, baseProps as Props];
}
