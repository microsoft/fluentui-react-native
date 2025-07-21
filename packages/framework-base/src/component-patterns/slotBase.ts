import * as React from 'react';

type CreateElementType = Parameters<typeof React.createElement>[0];
//type CreateElementResult = ReturnType<typeof React.createElement>;

// use a symbol to make this key private and only settable
const compressKey = Symbol('_compress');

export type CompressibleComponent<TProps> = {
  (props: TProps): React.ReactElement;
  [compressKey]?: boolean;
};

export function asCompressible<TProps>(component: CreateElementType): CompressibleComponent<TProps> | undefined {
  if (typeof component === 'function' && (component as CompressibleComponent<TProps>)[compressKey]) {
    return component as CompressibleComponent<TProps>;
  }
  return undefined;
}

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

export function renderSlot2<TProps>(slot: NativeReactType | SlotFn<TProps>, extraProps: TProps, ...children: React.ReactNode[]) {
  return typeof slot === 'function' && (slot as SlotFn<TProps>)._canCompose
    ? (slot as SlotFn<TProps>)(extraProps, ...children)
    : React.createElement(slot, extraProps, ...children);
}
