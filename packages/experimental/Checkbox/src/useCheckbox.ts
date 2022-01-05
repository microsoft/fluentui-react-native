import * as React from 'react';
import {
  useAsPressable,
  useKeyUpProps,
  useOnPressWithFocus,
  useViewCommandFocus,
  useAsToggle,
} from '@fluentui-react-native/interactive-hooks';
import { CheckboxProps, CheckboxInfo, CheckboxState } from './Checkbox.types';
import { IPressableProps } from '@fluentui-react-native/pressable';

/**
 * Re-usable hook for FURN Checkbox.
 * This hook configures checkbox props and state for FURN Checkbox.
 *
 * @param props user props sent to FURN Checkbox
 * @returns configured props and state for FURN Checkbox
 */
export const useCheckbox = (props: CheckboxProps): CheckboxInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    accessible,
    accessibilityLabel,
    accessibilityRole,
    checked,
    defaultChecked,
    labelPosition,
    label,
    onChange,
    componentRef = defaultComponentRef,
    ...rest
  } = props;

  // Warns defaultChecked and checked being mutually exclusive.
  if (defaultChecked != undefined && checked != undefined) {
    console.warn('defaultChecked and checked are mutually exclusive to one another. Use one or the other.');
  }

  // Re-usable hook for toggle components.
  const [isChecked, toggleChecked] = useAsToggle(defaultChecked, checked, onChange);

  // Ensure focus is placed on checkbox after click
  const toggleCheckedWithFocus = useOnPressWithFocus(componentRef, toggleChecked);

  // attach the pressable state handlers
  const pressable = useAsPressable({ onPress: toggleCheckedWithFocus, ...(rest as IPressableProps) });

  const buttonRef = useViewCommandFocus(componentRef);

  // Handles the "Space" key toggling the Checkbox
  const onKeyUpProps = useKeyUpProps(toggleChecked, ' ');

  const state: CheckboxState = {
    ...pressable.state,
    disabled: !!props.disabled,
    checked: isChecked,
    labelIsBefore: labelPosition === 'before' ? true : false,
  };

  const onAccessibilityAction = React.useCallback(
    (event: { nativeEvent: { actionName: any } }) => {
      switch (event.nativeEvent.actionName) {
        case 'Toggle':
          toggleChecked();
          break;
      }
    },
    [toggleChecked],
  );

  return {
    props: {
      ref: buttonRef,
      ...pressable.props,
      accessible: accessible ?? true,
      accessibilityRole: accessibilityRole ?? 'checkbox',
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityState: { disabled: state.disabled, checked: state.checked },
      accessibilityActions: [{ name: 'Toggle' }],
      focusable: !state.disabled,
      onAccessibilityAction: onAccessibilityAction,
      ...onKeyUpProps,
      ...props,
    },
    state: {
      ...pressable.state,
      ...state,
    },
  };
};
