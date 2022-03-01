import * as React from 'react';
import {
  useAsPressable,
  useKeyProps,
  useOnPressWithFocus,
  useViewCommandFocus,
  useAsToggleWithEvent,
} from '@fluentui-react-native/interactive-hooks';
import { CheckboxProps, CheckboxInfo, CheckboxState } from './Checkbox.types';
import { IPressableProps } from '@fluentui-react-native/pressable';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityActionEvent, AccessibilityState } from 'react-native';

const defaultAccessibilityActions = [{ name: 'Toggle' }];

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
    accessibilityActions,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
    checked,
    defaultChecked,
    labelPosition,
    label,
    onAccessibilityAction,
    onChange,
    componentRef = defaultComponentRef,
    ...rest
  } = props;

  // Warns defaultChecked and checked being mutually exclusive.
  if (defaultChecked != undefined && checked != undefined) {
    console.warn('defaultChecked and checked are mutually exclusive to one another. Use one or the other.');
  }

  // Re-usable hook for toggle components.
  const [isChecked, toggleChecked] = useAsToggleWithEvent(defaultChecked, checked, onChange);

  // Ensure focus is placed on checkbox after click
  const toggleCheckedWithFocus = useOnPressWithFocus(componentRef, toggleChecked);

  // attach the pressable state handlers
  const pressable = useAsPressable({ onPress: toggleCheckedWithFocus, ...(rest as IPressableProps) });

  const buttonRef = useViewCommandFocus(componentRef);

  // Handles the "Space" key toggling the Checkbox
  const onKeyUpProps = useKeyProps(toggleChecked, ' ');
  const accessibilityActionsProp = accessibilityActions
    ? [...defaultAccessibilityActions, ...accessibilityActions]
    : defaultAccessibilityActions;

  const state: CheckboxState = {
    ...pressable.state,
    disabled: !!props.disabled,
    checked: isChecked,
    labelIsBefore: labelPosition === 'before' ? true : false,
  };

  const onAccessibilityActionProp = React.useCallback(
    (event: AccessibilityActionEvent) => {
      switch (event.nativeEvent.actionName) {
        case 'Toggle':
          toggleChecked(event);
          break;
      }
      onAccessibilityAction && onAccessibilityAction(event);
    },
    [toggleChecked, onAccessibilityAction],
  );

  return {
    props: {
      ref: buttonRef,
      ...pressable.props,
      accessible: accessible ?? true,
      accessibilityRole: accessibilityRole ?? 'checkbox',
      accessibilityLabel: accessibilityLabel ?? label,
      accessibilityState: getAccessibilityState(state.disabled, state.checked, accessibilityState),
      accessibilityActions: accessibilityActionsProp,
      focusable: !state.disabled,
      onAccessibilityAction: onAccessibilityActionProp,
      enableFocusRing: true,
      ...onKeyUpProps,
      ...props,
    },
    state: {
      ...pressable.state,
      ...state,
    },
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, checked: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled: disabled, checked: checked, ...accessibilityState };
  }
  return { disabled: disabled, checked: checked };
}
