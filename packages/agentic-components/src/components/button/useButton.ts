import * as React from 'react';
import type { ButtonProps, ButtonState } from './button.types';
import { usePressableState, useSlot, useOptionalSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../../primitives/icon/icon';

/**
 * Hook to create the state for a Button component. This is responsible for:
 * - resolving the prop states to their default values if unset
 * - setting up any accessibility for the component
 * - querying the theme state for the component
 * - initializing the component slots
 */
export function useButton_unstable(props: ButtonProps): ButtonState {
  const {
    accessibilityState,
    appearance,
    content: contentProp,
    disabled = false,
    icon: iconProp,
    iconPosition = 'before',
    selected,
    selectedIcon: selectedIconProp,
    shape,
    size = 'medium',
    style: userStyle,
    ...rest
  } = props;
  const hasContent = contentProp !== undefined && contentProp !== null;
  const hasIcon = iconProp !== undefined && iconProp !== null;
  const hasSelectedIcon = selectedIconProp !== undefined && selectedIconProp !== null;
  const iconOnly = !hasContent && (hasIcon || hasSelectedIcon);
  const isToggleButton = selected !== undefined;
  React.useEffect(() => {
    if (__DEV__ && iconOnly && !rest.accessibilityLabel) {
      console.warn('Button: icon-only buttons require an accessibilityLabel that describes the action.');
    }
  }, [iconOnly, rest.accessibilityLabel]);
  const themeState = useThemeState();
  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessibilityRole: 'button',
    accessibilityState: {
      ...accessibilityState,
      disabled,
      ...(isToggleButton && { checked: selected }),
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: rest.focusable ?? !disabled,
  });
  const root = useSlot(Pressable, pressableProps);
  const icon = useOptionalSlot(Icon, iconProp);
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp);
  const content = useOptionalSlot(Text, contentProp);
  const contentHidden = useOptionalSlot(Text, isToggleButton ? contentProp : null);
  const contentContainer = useOptionalSlot(View, isToggleButton && hasContent ? {} : null);

  return {
    root,
    icon,
    selectedIcon,
    content,
    contentHidden,
    contentContainer,
    disabled,
    appearance: appearance ?? 'secondary',
    size,
    shape: shape ?? (iconOnly ? 'circle' : 'rounded'),
    iconPosition,
    selected: selected ?? false,
    iconOnly,
    isToggleButton,
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
