import type { ButtonProps, ButtonState } from './button.types';
import { usePressableState, useSlot, useOptionalSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { Pressable, Text } from 'react-native';
import { Icon } from '../icon/icon';

/**
 * Hook to create the state for a Button component. This is responsible for:
 * - resolving the prop states to their default values if unset
 * - setting up any accessibility for the component
 * - querying the theme state for the component
 * - initializing the component slots
 */
export function useButton_unstable(props: ButtonProps): ButtonState {
  const { disabled, appearance, size, shape, iconPosition, icon: iconProp, content: contentProp, ...rest } = props;
  const themeState = useThemeState();
  const [pressableProps, pressableState] = usePressableState(rest);
  const root = useSlot(Pressable, pressableProps);
  const icon = useOptionalSlot(Icon, iconProp);
  const content = useOptionalSlot(Text, contentProp);

  return {
    root,
    icon,
    content,
    disabled: !!disabled,
    appearance: appearance ?? 'primary',
    size: size ?? 'medium',
    shape: shape ?? 'rounded',
    iconPosition: iconPosition ?? 'before',
    ...themeState,
    ...pressableState,
  };
}
