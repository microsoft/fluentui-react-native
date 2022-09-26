import * as React from 'react';
import { usePressableState, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ButtonProps, ButtonInfo } from './Button.types';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState } from 'react-native';

export const useButton = (props: ButtonProps): ButtonInfo => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onClick, accessibilityState, componentRef = defaultComponentRef, disabled, loading, enableFocusRing, focusable, ...rest } = props;
  const isDisabled = !!disabled || !!loading;
  // GH #1336: Set focusRef to null if button is disabled to prevent getting keyboard focus.
  const focusRef = isDisabled ? null : componentRef;
  const onClickWithFocus = useOnPressWithFocus(focusRef, onClick);
  const pressable = usePressableState({ ...rest, disabled: isDisabled, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyProps(onClick, ' ', 'Enter');
  const hasTogglePattern = props.accessibilityActions && !!props.accessibilityActions.find((action) => action.name === 'Toggle');

  return {
    props: {
      ...onKeyUpProps,
      ...pressable.props, // allow user key events to override those set by us
      accessible: true,
      accessibilityRole: 'button',
      onAccessibilityTap: props.onAccessibilityTap || (!hasTogglePattern ? props.onClick : undefined),
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: getAccessibilityState(isDisabled, accessibilityState),
      enableFocusRing: enableFocusRing ?? true,
      focusable: focusable ?? !isDisabled,
      ref: useViewCommandFocus(componentRef),
      iconPosition: props.iconPosition || 'before',
      loading,
    },
    state: pressable.state,
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled: disabled, ...accessibilityState };
  }
  return { disabled: disabled };
}
