import { useAsPressable, useKeyCallback, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';
import { ButtonProps, ButtonState } from './Button.types';

export const useButton = (props: ButtonProps): ButtonState => {
  // attach the pressable state handlers
  const { onClick, ...rest } = props;
  const pressable = useAsPressable({ ...rest, onPress: onClick });
  const onKeyUp = useKeyCallback(onClick, ' ', 'Enter');

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'button',
      onAccessibilityTap: props.onAccessibilityTap || props.onClick,
      accessibilityLabel: props.accessibilityLabel || props.content,
      focusable: true,
      ref: useViewCommandFocus(props.componentRef),
      onKeyUp: onKeyUp,
    },
    state: pressable.state,
  };
};
