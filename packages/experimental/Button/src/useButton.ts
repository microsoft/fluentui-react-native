import * as React from 'react';
import { useAsPressable, useKeyCallback, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ButtonProps, ButtonState } from './Button.types';
import { memoize } from '@fluentui-react-native/framework';

export const useButton = (props: ButtonProps): ButtonState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onClick, componentRef = defaultComponentRef, disabled, ...rest } = props;
  const onClickWithFocus = useOnPressWithFocus(componentRef, onClick);
  const pressable = useAsPressable({ ...rest, onPress: onClickWithFocus });
  const onKeyUp = useKeyCallback(onClick, ' ', 'Enter');

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'button',
      onAccessibilityTap: props.onAccessibilityTap || props.onClick,
      accessibilityLabel: props.accessibilityLabel || props.content,
      accessibilityState: getAccessibilityState(!!disabled),
      focusable: true,
      ref: useViewCommandFocus(componentRef),
      onKeyUp: onKeyUp,
      iconPosition: props.iconPosition || 'before',
    },
    state: pressable.state,
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean) {
  return { disabled: disabled };
}
