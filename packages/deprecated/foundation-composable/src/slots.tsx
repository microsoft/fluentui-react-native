import * as React from 'react';

import type { ISlotFn } from './Composable.slots';
import type { INativeSlotType } from './Composable.types';

function isComposableFunctionComponent<TProps>(slot: INativeSlotType | ISlotFn<TProps>): slot is ISlotFn<TProps> {
  return typeof slot === 'function' && (slot as ISlotFn<TProps>)._canCompose;
}

/**
 * Renders a slot
 *
 * @param slot - native react type or slot function to render
 * @param extraProps - additional props to mixin
 * @param children - the children to pass down to the slot
 */
export function renderSlot<TProps>(slot: INativeSlotType | ISlotFn<TProps>, extraProps: TProps, ...children: React.ReactNode[]) {
  return isComposableFunctionComponent(slot)
    ? slot(extraProps, ...children)
    : React.createElement(slot, extraProps, ...children);
}

/**
 * This function is required for any module that uses slots.
 *
 * This function is a slot resolver that automatically evaluates slot functions to generate React elements.
 * A byproduct of this resolver is that it removes slots from the React hierarchy by bypassing React.createElement.
 *
 * To use this function on a per-file basis, use the jsx directive targeting withSlots.
 * This directive must be the FIRST LINE in the file to work correctly.
 * Usage of this pragma also requires withSlots import statement.
 *
 * See React.createElement
 */
// Can't use typeof on React.createElement since it's overloaded. Approximate createElement's signature for now and widen as needed.
export function withSlots<P>(
  reactType: INativeSlotType,
  props?: (React.Attributes & P) | null,
  ...children: React.ReactNode[]
): ReturnType<React.FunctionComponent<P>> {
  // if it is a non-string type with _canCompose set just call the function directly, otherwise call createElement as normal
  return renderSlot<P>(reactType, props, ...children);
}
