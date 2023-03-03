import * as React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Platform } from 'react-native';

export type OnPressCallback = (args: GestureResponderEvent) => void;
export type OnPressWithFocusCallback = (args: GestureResponderEvent) => void;

/* Re-usable hook for pressable components.
 * This hook sets focus on a component after onPress behavior.
 *
 * PROPS:  focusRef - the ref used to set focus
 *         userCallback() - Callback provided by userProps for onPress behavior
 * RETURNS:
 *         onPressWithFocus() - Callback to set focus after calling the userCallback for onPress
 */
export function useOnPressWithFocus(focusRef: React.RefObject<any>, userCallback: OnPressCallback): OnPressWithFocusCallback {
  const onPressWithFocus = React.useCallback(
    (args?: any) => {
      userCallback?.(args);

      const platformSupportsFocus = ['windows', 'win32', 'macos'].includes(Platform.OS as string);
      if (platformSupportsFocus) {
        focusRef?.current?.focus();
      }
    },
    [userCallback, focusRef],
  );

  return onPressWithFocus;
}
