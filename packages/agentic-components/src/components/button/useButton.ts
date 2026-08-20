import type { ButtonProps, ButtonState } from './button.types';
import { useAccessibilityLabelWarning, usePressableState, useSlot, useOptionalSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { Pressable, Text } from 'react-native';
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

  // A button renders selection but never changes it: a press is an action, so the caller owns the selected value.
  const isToggleButton = selected !== undefined;

  useAccessibilityLabelWarning({
    accessibilityLabel: rest.accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Button',
    requireLabel: iconOnly,
    warning: 'Button: icon-only buttons require an accessibilityLabel that describes the action.',
  });

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
    selected: selected ?? false,
    iconOnly,
    isToggleButton,
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
