import * as React from 'react';

/**
 * Component slots have a marker which allows the slot render handler to know which ones are safe to call as a function.
 */
export type SlotFn<TProps> = React.FunctionComponent<TProps> & {
  _canCompose?: boolean;
};

/**
 * The standard element type inputs for react and react-native. This might be View or Button, or it might be 'div' in web. Effectively
 * it is what react accepts for React.createElement
 */
export type NativeReactType = React.ElementType<any> | string;

function withChildrenProps<TProps>(props: TProps, collectedChildren: React.ReactNode[]): React.PropsWithChildren<TProps> {
  const children = collectedChildren.length > 0 ? (collectedChildren.length === 1 ? collectedChildren[0] : collectedChildren) : undefined;
  return children ? { ...props, children } : props;
}

function withChildrenParams<TProps>(props: React.PropsWithChildren<TProps>, children: React.ReactNode[]): React.ReactNode[] {
  return children.length > 0 ? children : Array.isArray(props.children) ? props.children : [props.children];
}

/**
 * Renders a slot
 *
 * @param slot - native react type or slot function to render
 * @param extraProps - additional props to mixin
 * @param children - the children to pass down to the slot
 */
export function renderSlot<TProps>(slot: NativeReactType | SlotFn<TProps>, extraProps: TProps, ...children: React.ReactNode[]) {
  return typeof slot === 'function' && (slot as SlotFn<TProps>)._canCompose
    ? (slot as SlotFn<TProps>)(withChildrenProps(extraProps, children))
    : React.createElement(slot, extraProps, ...withChildrenParams(extraProps, children));
}
