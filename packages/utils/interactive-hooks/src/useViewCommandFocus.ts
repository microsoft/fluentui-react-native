import * as React from 'react';
import { View } from 'react-native';

export type IFocusable = View;

/**
 * This is a no-op on platforms that don't support focus imperative calls
 * @param forwardRef - The componentRef from your component's props where you're exposing a imperative focus method.
 * @returns The inner View-type you're rendering that you want to dispatch to & focus on.
 */
export function useViewCommandFocus<T>(
  _: React.Ref<T | null> | undefined,
  initialValue?: React.Component,
): React.RefObject<React.Component> {
  const innerRef = React.useRef<React.Component>(initialValue || null);
  return innerRef;
}
