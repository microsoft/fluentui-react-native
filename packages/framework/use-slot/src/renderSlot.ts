import * as React from 'react';

interface LegacyFunctionComponent<P = unknown> extends React.FunctionComponent<P> {
  (props: P, ...children: React.ReactNode[]): React.ReactElement<any, any> | null;
}

/**
 * Component slots have a marker which allows the slot render handler to know which ones are safe to call as a function.
 */
export type SlotFn<TProps> = LegacyFunctionComponent<TProps> & {
  _canCompose?: boolean;
};

/**
 * The standard element type inputs for react and react-native. This might be View or Button, or it might be 'div' in web. Effectively
 * it is what react accepts for React.createElement
 */
export type NativeReactType = React.ElementType<any> | string;

function isComposableFunctionComponent<TProps>(slot: NativeReactType | SlotFn<TProps>): slot is SlotFn<TProps> {
  return typeof slot === 'function' && (slot as SlotFn<TProps>)._canCompose;
}

/**
 * Renders a slot
 *
 * @param slot - native react type or slot function to render
 * @param extraProps - additional props to mixin
 * @param children - the children to pass down to the slot
 */
export function renderSlot<TProps>(slot: NativeReactType | SlotFn<TProps>, extraProps: TProps, ...children: React.ReactNode[]) {
  return isComposableFunctionComponent(slot)
    ? slot(extraProps, ...children)
    : React.createElement(slot, extraProps, ...children);
}
