import * as React from 'react';
import type { SlotComponent } from '../types/render.types';
import { setSlotStatics } from './slot';
import { createSlotComponent } from './render';
import { isPhasedComponent, isSlotShorthandValue, isStagedComponent } from './identify';
import { SLOT_COMPONENT_KEY } from '../const';
import { prepareStagedProps } from './phased';
import type { AnyComponent, SlotProp, SlotShorthandValue, UseSlot, UseOptionalSlot, PropsTransform, SlotOptions } from '../types/component.types';
import type { PropsWithRefOf } from '../types/props.types';
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
export const useSlot: UseSlot = <Type extends AnyComponent>(
  baseComponent: Type,
  slotProp: SlotProp<Type> | undefined,
  options?: PropsTransform<Type> | SlotOptions<Type>,
): SlotComponent<PropsWithRefOf<Type>> => {
  // local type to make things easier to read and maintain
  type PropsType = PropsWithRefOf<Type>;
  // resolve the options to a single object, then update the component and props based on the slot prop
  const { defaultProps, transform } = resolveOptions(options);
  let [component, hookProps] = resolveSlotProps(slotProp, baseComponent, defaultProps);

  // handle the component being a phased/staged render
  if (isPhasedComponent(component)) {
    // phased components can pass through children given that it is carried along with the props
    component = component[SLOT_COMPONENT_KEY](hookProps);
    hookProps = {} as PropsType;
  } else if (isStagedComponent<Type>(component)) {
    [component, hookProps] = prepareStagedProps(component[SLOT_COMPONENT_KEY], hookProps);
  }
  // now onto the slot creation itself, use a ref to get per-instance storage for the slot
  const slotRef = React.useRef<SlotComponent<PropsType> | null>(null);
  if (slotRef.current == null) {
    slotRef.current = createSlotComponent<PropsType>(component, hookProps, transform);
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
export const useOptionalSlot: UseOptionalSlot = <Type extends AnyComponent>(
  baseComponent: Type,
  slotProp: SlotProp<PropsWithRefOf<Type>> | undefined | null,
  options?: PropsTransform<Type> | SlotOptions<Type>,
): SlotComponent<PropsWithRefOf<Type>> | undefined => {
  type PropsType = PropsWithRefOf<Type>;
  options = resolveOptions(options);
  if (slotProp === null || (slotProp === undefined && !options.renderByDefault)) {
    return undefined;
  }
  return useSlot<Type>(baseComponent, slotProp, options) as SlotComponent<PropsType>;
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
export function useSlotProp<Type extends AnyComponent>(
  prop: Exclude<SlotProp<Type>, SlotShorthandValue>,
  baseComponent: Type,
  baseProps?: Partial<PropsWithRefOf<Type>>,
): SlotComponent<Partial<PropsWithRefOf<Type>>>;
export function useSlotProp<Type extends AnyComponent>(
  prop: SlotProp<Type> | undefined,
  baseComponent: Type,
  baseProps: PropsWithRefOf<Type>,
): SlotComponent<Partial<PropsWithRefOf<Type>>>;
export function useSlotProp<Type extends AnyComponent>(
  prop: SlotProp<Type> | undefined,
  baseComponent: Type,
  baseProps?: Partial<PropsWithRefOf<Type>>,
): SlotComponent<PropsWithRefOf<Type>>;
export function useSlotProp<Type extends AnyComponent>(
  prop: SlotProp<Type> | undefined,
  baseComponent: Type,
  baseProps: Partial<PropsWithRefOf<Type>> = {},
): SlotComponent<PropsWithRefOf<Type>> {
  return useSlot<Type>(baseComponent, prop, { defaultProps: baseProps }) as SlotComponent<PropsWithRefOf<Type>>;
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
export function useOptionalSlotProp<Type extends AnyComponent>(
  prop: Exclude<SlotProp<Type>, SlotShorthandValue>,
  baseComponent: Type,
  baseProps?: Partial<PropsWithRefOf<Type>>,
): SlotComponent<Partial<PropsWithRefOf<Type>>> | undefined;
export function useOptionalSlotProp<Type extends AnyComponent>(
  prop: SlotProp<Type> | null | undefined,
  baseComponent: Type,
  baseProps: PropsWithRefOf<Type>,
): SlotComponent<Partial<PropsWithRefOf<Type>>> | undefined;
export function useOptionalSlotProp<Type extends AnyComponent>(
  prop: SlotProp<Type> | null | undefined,
  baseComponent: Type,
  baseProps?: Partial<PropsWithRefOf<Type>>,
): SlotComponent<PropsWithRefOf<Type>> | undefined;
export function useOptionalSlotProp<Type extends AnyComponent>(
  prop: SlotProp<Type> | null | undefined,
  baseComponent: Type,
  baseProps: Partial<PropsWithRefOf<Type>> = {},
): SlotComponent<PropsWithRefOf<Type>> | undefined {
  return useOptionalSlot<Type>(baseComponent, prop, { defaultProps: baseProps }) as SlotComponent<PropsWithRefOf<Type>> | undefined;
}

/**
 * Resolves the final component and props for a slot.
 * @param prop The slot prop, which can be a component, shorthand value, or null/undefined.
 * @param baseComponent The base component to use if the prop does not specify one.
 * @param baseProps The base props to merge with the prop's props.
 * @returns A tuple containing the resolved component and props.
 */
function resolveSlotProps<Type extends AnyComponent>(
  prop: SlotProp<Type> | null | undefined,
  baseComponent: Type,
  baseProps: Partial<PropsWithRefOf<Type>> = {},
): [React.ComponentType<PropsWithRefOf<Type>>, PropsWithRefOf<Type>] {
  let component: React.ComponentType<PropsWithRefOf<Type>> = baseComponent;
  if (prop != null) {
    if (isSlotShorthandValue(prop)) {
      baseProps = { ...baseProps, children: prop };
    } else if (isObject(prop)) {
      const { as, ...userProps } = prop as { as?: React.ComponentType<PropsWithRefOf<Type>> };
      if (as != null) {
        component = as;
      }
      if (userProps != null && Object.keys(userProps).length > 0) {
        baseProps = mergeProps(baseProps, userProps);
      }
    }
  }
  return [component, baseProps as PropsWithRefOf<Type>];
}

/**
 * Resolve the options to a single SlotOptions object, whether it is passed in as a function or an object.
 * @param options The options to resolve, which can be a function or an object.
 * @returns The resolved SlotOptions object.
 */
function resolveOptions<Type extends AnyComponent>(options?: PropsTransform<Type> | SlotOptions<Type>): SlotOptions<Type> {
  return typeof options === 'function' ? { transform: options } : options ?? {};
}