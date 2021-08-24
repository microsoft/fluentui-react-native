import * as React from 'react';
import { findNodeHandle, NativeModules, View } from 'react-native';

const setAndForwardRef = require('./setAndForwardRef');

export type IFocusable = View;
/**
 * A hook to add an imperative focus method to functional components which simply dispatch a focus command to
 * something View-derived on the native side.  In practice, this effectively applies to all components in our Win32
 * react native implementation.
 * @param forwardRef - The componentRef from your component's props where you're exposing a imperative focus method.
 * @returns The inner View-type you're rendering that you want to dispatch to & focus on.
 */
export function useViewCommandFocus(
  forwardedRef: React.Ref<View | null> | undefined,
  // initialValue?: React.Component
): (ref: React.ElementRef<any>) => void {
  /**
   * Set up the forwarding ref to enable adding the focus method.
   */
  const focusRef = React.useRef<React.Component>();

  const _setNativeRef = setAndForwardRef({
    getForwardedRef: () => forwardedRef,
    setLocalRef: localRef => {
      focusRef.current = localRef;

      /**
       * Add focus() as a callable function to the forwarded reference.
       */
      if (localRef) {
        localRef.focus = () => {
          NativeModules.UIManager.dispatchViewManagerCommand(
            findNodeHandle(localRef),
            NativeModules.UIManager.getViewManagerConfig('RCTView').Commands.focus,
            null,
          );
        };
      }
    },
  });
  return _setNativeRef;
}
