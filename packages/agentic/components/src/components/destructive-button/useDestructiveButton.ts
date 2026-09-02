import type { DestructiveButtonProps, DestructiveButtonState } from './destructive-button.types';
import { useAccessibilityLabelWarning, usePressableState, useSlot, useOptionalSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { Pressable } from 'react-native';
import type { PressableProps } from 'react-native';
import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';

type NativeFocusPressableProps = PressableProps & {
  enableFocusRing: boolean;
};

/**
 * Hook to create the state for a DestructiveButton component. This is responsible for:
 * - resolving the prop states to their default values if unset
 * - setting up any accessibility for the component
 * - querying the theme state for the component
 * - initializing the component slots
 */
export function useDestructiveButton_unstable(props: DestructiveButtonProps): DestructiveButtonState {
  const {
    accessibilityState,
    appearance = 'primary',
    content: contentProp,
    disabled = false,
    icon: iconProp,
    iconPosition = 'before',
    ref: rootRef,
    shape,
    size = 'medium',
    style: userStyle,
    ...rest
  } = props;
  const hasContent = contentProp !== undefined && contentProp !== null;
  const hasIcon = iconProp !== undefined && iconProp !== null;
  const iconOnly = !hasContent && hasIcon;

  useAccessibilityLabelWarning({
    accessibilityLabel: rest.accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'DestructiveButton',
    requireLabel: iconOnly,
    warning: 'DestructiveButton: icon-only buttons require an accessibilityLabel that describes the action.',
  });

  const themeState = useThemeState();
  const nativeProps: NativeFocusPressableProps = {
    ...rest,
    role: 'button',
    accessibilityState: {
      ...accessibilityState,
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    // RNW 0.81 crashes when either outline props or its native focus ring creates border visuals after mount.
    enableFocusRing: false,
    focusable: rest.focusable ?? !disabled,
  };
  const [pressableProps, pressableState] = usePressableState(nativeProps);
  const root = useSlot(Pressable, { ...pressableProps, ref: rootRef });
  const icon = useOptionalSlot(Icon, iconProp);
  const content = useOptionalSlot(Text, contentProp);

  return {
    root,
    icon,
    content,
    disabled,
    size,
    shape: shape ?? (iconOnly ? 'circle' : 'rounded'),
    iconPosition,
    iconOnly,
    userStyle,
    ...themeState,
    ...pressableState,
    appearance,
  };
}
