import * as React from 'react';
import { useAsPressable, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ButtonProps, ButtonState } from './Button.types';

export const useButton = (props: ButtonProps): ButtonState => {
  // attach the pressable state handlers
  const { onClick, ...rest } = props;
  const pressable = useAsPressable({ ...rest, onPress: onClick });
  const onKeyUp = React.useCallback(
    (e) => {
      if (onClick && (e.nativeEvent.key === 'Enter' || e.nativeEvent.key === ' ')) {
        onClick();
        e.stopPropagation();
      }
    },
    [onClick],
  );

  return {
    props: {
      ...pressable.props,
      accessible: true,
      acceptsKeyboardFocus: true,
      accessibilityRole: 'button',
      onAccessibilityTap: props.onAccessibilityTap || props.onClick,
      accessibilityLabel: props.accessibilityLabel || props.content,
      ref: useViewCommandFocus(props.componentRef),
      onKeyUp: onKeyUp,
    },
    state: pressable.state,
  };
};
