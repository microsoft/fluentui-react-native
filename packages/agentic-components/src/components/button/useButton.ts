import * as React from 'react';

import type { ButtonProps, ButtonState } from './button.types';
import {
  useAccessibilityLabelWarning,
  usePressableState,
  useSlot,
  useOptionalSlot,
  useToggleState,
} from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { Pressable, Text } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import { Icon } from '../../primitives/icon/icon';

/**
 * Hook to create the state for a Button component. This is responsible for:
 * - resolving the prop states to their default values if unset
 * - resolving the externally driven or internally driven selected state
 * - setting up any accessibility for the component
 * - querying the theme state for the component
 * - initializing the component slots
 */
export function useButton_unstable(props: ButtonProps): ButtonState {
  const {
    accessibilityState,
    appearance,
    content: contentProp,
    defaultSelected,
    disabled = false,
    icon: iconProp,
    iconPosition = 'before',
    onPress,
    onSelectedChange,
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

  // The button becomes a toggle button when the caller opts into the selection axis, externally or internally driven.
  const selection = useToggleState({ value: selected, defaultValue: defaultSelected, onChange: onSelectedChange, disabled });
  const isToggleButton = selection.enabled;

  useAccessibilityLabelWarning({
    accessibilityLabel: rest.accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Button',
    requireLabel: iconOnly,
    warning: 'Button: icon-only buttons require an accessibilityLabel that describes the action.',
  });

  const { activate } = selection;
  const handlePress = React.useCallback(
    (event: GestureResponderEvent) => {
      activate();
      onPress?.(event);
    },
    [activate, onPress],
  );

  const themeState = useThemeState();
  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessibilityRole: 'button',
    accessibilityState: {
      ...accessibilityState,
      disabled,
      ...(isToggleButton && { checked: selection.value }),
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: rest.focusable ?? !disabled,
    onPress: handlePress,
  });
  const root = useSlot(Pressable, pressableProps);
  const icon = useOptionalSlot(Icon, iconProp);
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp);
  const content = useOptionalSlot(Text, contentProp);
  const contentHidden = useOptionalSlot(Text, isToggleButton ? contentProp : null);

  return {
    root,
    icon,
    selectedIcon,
    content,
    contentHidden,
    disabled,
    appearance: appearance ?? 'secondary',
    size,
    shape: shape ?? (iconOnly ? 'circle' : 'rounded'),
    iconPosition,
    selected: selection.value,
    iconOnly,
    isToggleButton,
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
