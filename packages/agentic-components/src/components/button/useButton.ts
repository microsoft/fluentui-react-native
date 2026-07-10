import type { ButtonProps, ButtonState } from './button.types';
import { usePressableState, useSlot } from '@fluentui-react-native/framework-base';
import { shapeStyle } from '@fluentui-react-native/design';
import { Pressable, Text } from 'react-native';

export function useButton_unstable(props: ButtonProps): ButtonState {
  const { title, shape, children, ...userProps } = props;
  const [pressableProps, state] = usePressableState(userProps);

  return {
    ...state,
    root: useSlot(Pressable, pressableProps),
    content: useSlot(Text, { children: children ?? title }),
    shape: shapeStyle(shape),
  };
}
