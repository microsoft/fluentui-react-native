import * as React from 'react';
import { useAsPressable, useKeyUpProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ButtonPropsWithInnerRef, ButtonState } from './Button.types';
import { memoize } from '@fluentui-react-native/framework';

export const useButton = (props: ButtonPropsWithInnerRef): ButtonState => {
  // attach the pressable state handlers
  const defaultRef = React.useRef(null);
  const { onClick, innerRef, disabled, loading, ...rest } = props;
  const ref = innerRef !== null ? innerRef : defaultRef;
  const onClickWithFocus = useOnPressWithFocus(ref, onClick);
  const pressable = useAsPressable({ ...rest, onPress: onClickWithFocus });
  const onKeyUpProps = useKeyUpProps(onClick, ' ', 'Enter');

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'button',
      onAccessibilityTap: props.onAccessibilityTap || props.onClick,
      accessibilityLabel: props.accessibilityLabel || props.content,
      accessibilityState: getAccessibilityState(!!disabled || !!loading),
      focusable: true,
      ref: useViewCommandFocus(ref),
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
