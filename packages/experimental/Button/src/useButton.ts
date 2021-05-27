import * as React from 'react';
import { useAsPressable, useKeyCallback, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ButtonProps, ButtonState } from './Button.types';

export const useButton = (props: ButtonProps): ButtonState => {
  // attach the pressable state handlers
  const { onClick, componentRef = React.useRef(null), ...rest } = props;
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
      focusable: true,
      ref: useViewCommandFocus(componentRef),
      onKeyUp: onKeyUp,
    },
    state: pressable.state,
  };
};
