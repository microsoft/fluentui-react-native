import * as React from 'react';

import type { SlotComponent, UseSlot, UseOptionalSlot, PropsTransform } from '../types/render.types';
import { setSlotStatics } from './slot';
import { createSlotComponent } from './render';
import { isPhasedComponent, isStagedComponent } from './phased';
import { SLOT_COMPONENT_KEY } from '../const';
import { isLegacyDirectComponent, legacyDirectComponent } from './direct';
import { splitPropsAndChildren } from '../utilities/typeUtils';

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
    // staged components need children passed along to the next stage
    const [props, childrenProp] = splitPropsAndChildren(hookProps);
    if (childrenProp != null) {
      // force cast, if it has children we know it is in the TProps type but that can't be inferred by typescript
      hookProps = childrenProp as Partial<TProps>;
    }
    // call the first stage and get the inner component, which will be a LegacyFunctionComponent
    const inner = component[SLOT_COMPONENT_KEY](props as Partial<TProps>);
    // attach the type signifier if necessary as legacy consumers aren't reliable about this
    component = isLegacyDirectComponent(inner) ? inner : legacyDirectComponent(inner);
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
): SlotComponent<TProps> | null => {
  // just create the hook itself
  const slotRef = React.useRef<SlotComponent<TProps> | null>(null);
  if (component != null) {
    if (slotRef.current == null) {
      slotRef.current = createSlotComponent<TProps>(component, hookProps, transform);
    } else {
      // update the existing slot with new props and transform if necessary
      setSlotStatics(slotRef.current, component, hookProps, transform);
    }
  } else {
    slotRef.current = null;
  }
  return slotRef.current;
};
