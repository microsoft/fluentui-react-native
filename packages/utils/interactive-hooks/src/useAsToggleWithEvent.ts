import * as React from 'react';

import type { InteractionEvent } from './events.types';
import { useControllableValue } from './useControllableValue';

export type OnToggleWithEventCallback = (e: InteractionEvent, value?: boolean) => void;
export type OnChangeWithEventCallback = (e: InteractionEvent) => void;

/* Re-usable hook for toggle components.
 * This hook configures the checked state, the callback to toggle the component
 * It handles the controlled/uncontrolled functionality of the toggle component.
 *
 * PROPS:  defaultChecked - Default checked state. Mutually exclusive to ‘checked’. This should come from userProps
 *         checked - Checked state. Mutually exclusive to 'defaultChecked'. This should come from userProps
 *         userCallback() - Callback provided by userProps when the checked (toggle) state changes
 * RETURNS:
 *         onChange() - Callback to toggle the component
 *         state.isChecked - Whether or not component is currently checked or selected
 */
export function useAsToggleWithEvent(
  defaultChecked?: boolean,
  checked?: boolean,
  userCallback?: OnToggleWithEventCallback,
): [boolean, OnChangeWithEventCallback] {
  const [isChecked, setChecked] = useControllableValue(checked, defaultChecked);

  const onChange = React.useCallback(
    (e: any) => {
      userCallback && userCallback(e, !isChecked);
      setChecked(!isChecked);
    },
    [isChecked, setChecked, userCallback],
  );

  return [checked ?? isChecked, onChange];
}
