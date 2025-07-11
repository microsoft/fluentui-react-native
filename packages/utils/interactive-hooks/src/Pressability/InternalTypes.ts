/**
 * A collection of internal types from react-native that are not currently exposed in TypeScript
 */

import type * as React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ObjectBase = {};

export type Rect = Readonly<{
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
}>;

export type RectOrSize = Rect | number;

export function normalizeRect(size: RectOrSize): Rect {
  return typeof size === 'number' ? { bottom: size, left: size, right: size, top: size } : size;
}

export type MeasureOnSuccessCallback = (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void;

export type MeasureInWindowOnSuccessCallback = (x: number, y: number, width: number, height: number) => void;

export type MeasureLayoutOnSuccessCallback = (left: number, top: number, width: number, height: number) => void;

/**
 * temporary port of changes that are in flight for the react and react-native types definition
 */
export interface ComponentMethods<Props> {
  context: any;
  props: Props;
  state: any;
  refs: {
    [key: string]: React.ReactInstance;
  };
  setState(state: any, cb?: () => void): void;
  render(): React.ReactNode;
  forceUpdate(callback?: () => void): void;
}

/**
 * temporary port of changes that are in flight for the react and react-native types definition
 */
export type AbstractComponent<Config extends ObjectBase, Instance = unknown> =
  // Either a function component that has a specific return type:
  | (React.FunctionComponent<Config> & ((props: React.PropsWithChildren<Config>, context?: any) => Instance))
  // ...or a class component that has the required Component methods and the Instance methods
  | { new (props: Config, context?: any): Instance & ComponentMethods<Config> };

/**
 * internal definitions from RN project
 */
export type NativeMethods = {
  blur(): void;
  focus(): void;
  measure(callback: MeasureOnSuccessCallback): void;
  measureInWindow(callback: MeasureInWindowOnSuccessCallback): void;
  measureLayout(
    relativeToNativeNode: number | React.ElementRef<HostComponent<any>>,
    onSuccess: MeasureLayoutOnSuccessCallback,
    onFail?: () => void,
  ): void;
  setNativeProps(nativeProps: ObjectBase): void;
};

export type HostComponent<T> = AbstractComponent<T, Readonly<NativeMethods>>;
