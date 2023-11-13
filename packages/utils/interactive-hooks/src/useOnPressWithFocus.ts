import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Platform } from 'react-native';

export type OnPressCallback = (args: GestureResponderEvent) => void;
export type OnPressWithFocusCallback = (args: GestureResponderEvent) => void;

/**
 * Sets focus on the focusRef after calling the userCallback for onPress, if that is an expected behavior on the platform
 * @param focusRef the ref used to set focus, generally the ref of the component that is being pressed
 * @param userCallback user-provided callback for onPress behavior
 * @returns Hook that sets focus, then calls the user callback
 */
export function useOnPressWithFocus(focusRef: React.RefObject<any>, userCallback: OnPressCallback): OnPressWithFocusCallback {
  const onPressWithFocus = React.useCallback(
    (args?: any) => {
      const platformSupportsFocus = ['windows', 'win32', 'macos'].includes(Platform.OS as string);
      const takesFocusOnClick = ['windows', 'win32'].includes(Platform.OS as string);
      if (platformSupportsFocus && takesFocusOnClick) {
        focusRef?.current?.focus();
      }

      userCallback?.(args);
    },
    [userCallback, focusRef],
  );

  return onPressWithFocus;
}
