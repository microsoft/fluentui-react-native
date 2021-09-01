import * as React from 'react';
import {
  useAsPressable,
  useKeyCallback,
  useOnPressWithFocus,
  useViewCommandFocus,
  useAsToggle,
} from '@fluentui-react-native/interactive-hooks';
import { CheckboxProps, CheckboxInfo, checkboxSelectActionLabel, CheckboxState } from './Checkbox.types';
import { IPressableProps } from '@fluentui-react-native/pressable';

export const useCheckbox = (props: CheckboxProps): CheckboxInfo => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { accessibilityLabel,
    checked,
    defaultChecked,
    boxSide,
    disabled,
    label,
    onChange,
    componentRef = defaultComponentRef,
    ...rest } = props;

  const [isChecked, toggleChecked] = useAsToggle(defaultChecked, checked, onChange);

  // Ensure focus is placed on checkbox after click
  const toggleCheckedWithFocus = useOnPressWithFocus(componentRef, toggleChecked);

  const pressable = useAsPressable({ onPress: toggleCheckedWithFocus, ...(rest as IPressableProps) });

  const buttonRef = useViewCommandFocus(componentRef);

  // Handles the "Space" key toggling the Checkbox
  const onKeyUpSpace = useKeyCallback(toggleChecked, ' ');

  const state: CheckboxState = {
    ...pressable.state,
    disabled: !!disabled,
    checked: isChecked,
    boxAtEnd: boxSide == undefined || boxSide == 'start' ? false : true,
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
      ...rest,
      ref: buttonRef,
      ...pressable.props,
      accessible: true,
      focusable: true,
      accessibilityRole: 'checkbox',
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityState: { disabled: state.disabled, checked: state.checked },
      accessibilityActions: [{ name: 'Toggle', label: checkboxSelectActionLabel }],
      onAccessibilityAction: onAccessibilityAction,
      onKeyUp: onKeyUpSpace,
      label: label,
    },
    state: {
      ...pressable.state,
      ...state
    },
  };
};
