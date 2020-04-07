import * as React from 'react';
import { findNodeHandle, NativeModules } from 'react-native';
import { IViewWin32 } from '@office-iss/react-native-win32';

export type IFocusable = IViewWin32;
/**
 * A hook to add an imperative focus method to functional components which simply dispatch a focus command to
 * something View-derived on the native side.  In practice, this effectively applies to all components in our Win32
 * react native implementation.
 * @param forwardRef - The componentRef from your component's props where you're exposing a imperative focus method.
 * @returns The inner View-type you're rendering that you want to dispatch to & focus on.
 */
export function useViewCommandFocus(
  forwardRef: React.Ref<IViewWin32 | null> | undefined,
  initialValue?: React.Component
): React.RefObject<React.Component> {
  const innerRef = React.useRef<React.Component>(initialValue || null);
  React.useImperativeHandle(forwardRef, () => ({
    focus: () => {
      if (innerRef.current) {
        NativeModules.UIManager.dispatchViewManagerCommand(
          findNodeHandle(innerRef.current),
          NativeModules.UIManager.getViewManagerConfig('RCTView').Commands.focus,
          null
        );
      }
    }
  }));
  return innerRef;
}