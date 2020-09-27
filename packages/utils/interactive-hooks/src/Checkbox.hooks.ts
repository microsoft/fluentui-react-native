import * as React from 'react';

export type OnToggleCallback = (value: boolean) => void;
export type OnChangeCallback = () => void;

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
export function useAsToggle(defaultChecked?: boolean, checked?: boolean, userCallback?: OnToggleCallback): [boolean, OnChangeCallback] {
  const [isChecked, setChecked] = React.useState(defaultChecked ?? checked);

  const onChange = React.useCallback(() => {
    userCallback && userCallback(!isChecked);
    setChecked(!isChecked);
  }, [isChecked]);

  return [checked ?? isChecked, onChange];
}
