import * as React from 'react';
import { useAsPressable, useKeyUpProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ButtonProps, ButtonState } from './Button.types';
import { memoize } from '@fluentui-react-native/framework';

export const useButton = (props: ButtonProps, ref: any): ButtonState => {
  // attach the pressable state handlers
  const defaultRef = React.useRef(null);
  const { onClick, disabled, loading, ...rest } = props;
  const innerRef = ref !== null && ref !== undefined ? ref : defaultRef;
  // GH #1336: Set focusRef to null if button is disabled to prevent getting keyboard focus.
  const focusRef = disabled ? null : innerRef;
  const onClickWithFocus = useOnPressWithFocus(focusRef, onClick);
  const pressable = useAsPressable({ ...rest, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyUpProps(onClick, ' ', 'Enter');
  const isDisabled = !!disabled || !!loading;

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'button',
      onAccessibilityTap: props.onAccessibilityTap || props.onClick,
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: getAccessibilityState(isDisabled),
      enableFocusRing: true,
      focusable: !isDisabled,
      ref: useViewCommandFocus(innerRef),
      ...onKeyUpProps,
      iconPosition: props.iconPosition || 'before',
      loading,
    },
    state: pressable.state,
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean) {
  return { disabled: disabled };
}
