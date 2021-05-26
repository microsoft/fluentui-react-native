import * as React from 'react';

export type OnPressCallback = (args?: any) => void;
export type OnPressWithFocusCallback = () => void;

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
      userCallback && userCallback(args);
      focusRef?.current?.focus();
    },
    [userCallback, focusRef],
  );

  return onPressWithFocus;
}
