import * as React from 'react';
import type { View } from 'react-native';

import { setAndForwardRef } from './setAndForwardRef';

export type IFocusable = View;
/**
 * We need the win32 version of this hook to work around an lack of a UIManager.focus implementation.
 * On other platforms this hook is unnecessary.
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
  const focusRef = React.useRef<any>(null);

  const _setNativeRef = setAndForwardRef({
    getForwardedRef: () => forwardedRef,
    setLocalRef: (localRef: any) => {
      focusRef.current = localRef;
    },
  });
  return _setNativeRef;
}
