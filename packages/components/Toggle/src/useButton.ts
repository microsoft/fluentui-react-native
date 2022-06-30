import * as React from 'react';
import { useAsPressable, useKeyProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ButtonProps, ButtonState } from './Toggle.types';
import { memoize } from '@fluentui-react-native/framework';
import { AccessibilityState, Animated } from 'react-native';

export const useButton = (props: ButtonProps): ButtonState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onClick, checked, accessibilityState, componentRef = defaultComponentRef, disabled, loading, enableFocusRing, ...rest } = props;
  const isDisabled = !!disabled || !!loading;
  const [checkedState, setCheckedState] = React.useState(checked);
  // GH #1336: Set focusRef to null if button is disabled to prevent getting keyboard focus.
  const focusRef = isDisabled ? null : componentRef;

  const toggleCallback = (e: any) => {
    const newCheckedState = !checkedState;
    onClick && onClick(e, newCheckedState);
    setCheckedState(newCheckedState);

    if (newCheckedState) {
      moveRight();
    } else {
      moveLeft();
    }
  };

  const onClickWithFocus = useOnPressWithFocus(focusRef, toggleCallback);
  const pressable = useAsPressable({ ...rest, disabled: isDisabled, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyProps(toggleCallback, ' ', 'Enter');
  const hasTogglePattern = props.accessibilityActions && !!props.accessibilityActions.find((action) => action.name === 'Toggle');

  const thumbX = React.useRef(new Animated.Value(0)).current;

  const moveRight = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(thumbX, {
      toValue: 100,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const moveLeft = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(thumbX, {
      toValue: 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'button',
      onAccessibilityTap: props.onAccessibilityTap || (!hasTogglePattern ? props.onClick : undefined),
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: getAccessibilityState(isDisabled, accessibilityState),
      enableFocusRing: enableFocusRing ?? true,
      focusable: !isDisabled,
      ref: useViewCommandFocus(componentRef),
      ...onKeyUpProps,
      iconPosition: props.iconPosition || 'before',
      loading,
      checked: props.checked || false,
    },
    state: {
      ...pressable.state,
      checked: checkedState,
      thumbX: thumbX,
    },
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled: disabled, ...accessibilityState };
  }
  return { disabled: disabled };
}
