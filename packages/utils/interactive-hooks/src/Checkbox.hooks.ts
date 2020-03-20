import * as React from 'react';
import { IKeyboardEvent } from '@office-iss/react-native-win32';

export type OnToggleCallback = (value: boolean) => void;
export type BoxSideType = 'start' | 'end' | undefined;
export type KeyUpCallback = () => void;

/* Re-usable hook for toggle components.
 ** This hook configures the checked state, the callback to toggle the component, and configures the boxSide prop/state.
 ** It handles the controlled/uncontrolled functionality of the toggle component.
 **
 ** PROPS:  defaultChecked - Default checked state. Mutually exclusive to ‘checked’. This should come from userProps
 **         checked - Checked state. Mutually exclusive to 'defaultChecked'. This should come from userProps
 **         userCallback() - Callback provided by userProps when the checked (toggle) state changes
 **         boxSide - Allows you to set the toggle to be at the before (start) or after (end) the label. Comes from userProps
 ** RETURNS:
 **         onChange() - Callback to toggle the component
 **         state.isChecked - Whether or not component is currently checked or selected
 **         state.boxAtEnd - Whether the toggle component is at the end or start
 */
export function useAsToggle(defaultChecked?: boolean, checked?: boolean, userCallback?: OnToggleCallback, boxSide?: BoxSideType) {
  // NOTE: Using "defaultChecked ?? checked" gives me a parsing error when building
  const [isChecked, setChecked] = React.useState(defaultChecked != undefined ? defaultChecked : checked);

  const onChange = React.useCallback(() => {
    userCallback && userCallback(!isChecked);
    setChecked(!isChecked);
  }, [isChecked]);

  const boxAtEnd = boxSide == undefined || boxSide == 'start' ? false : true;

  return { onChange, state: { isChecked: checked != undefined ? checked : isChecked, boxAtEnd } };
}

/* Re-usable hook for an onKeyUp/onKeyDown event.
 ** PROPS:
 **    key - A string of the key you want to perform some action on. If undefined, always invokes userCallback
 **    userCallback - The function you want to be called once the key has been activated on key up
 */
export function useKeyCallback(key?: string, userCallback?: KeyUpCallback) {
  const onKeyEvent = React.useCallback(
    (args: IKeyboardEvent) => {
      if (args.nativeEvent.key === key || key === undefined) {
        userCallback && userCallback();
      }
    },
    [userCallback, key]
  );

  return onKeyEvent;
}
