import type { ButtonProps, ButtonState } from './button.types';
import { useAccessibilityLabelWarning, useFocusablePressable, useSlot, useOptionalSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { getComponentTokens } from '@fluentui-react-native/design/styling';
import { Pressable } from 'react-native';
import type { PressableProps } from 'react-native';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';
import { buttonTokenDefinition, getButtonVisualState } from './button.styles';

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
    leadingIcon: leadingIconProp,
    trailingIcon: trailingIconProp,
    ref: rootRef,
    shape = 'rounded',
    size = 'medium',
    style: userStyle,
    ...rest
  } = props;
  const hasContent = contentProp !== undefined && contentProp !== null;
  const iconOnly = !hasContent && leadingIconProp != null;
  const contentChildren = contentProp && typeof contentProp === 'object' && 'children' in contentProp ? contentProp.children : contentProp;
  const contentLabel = typeof contentChildren === 'string' || typeof contentChildren === 'number' ? String(contentChildren) : undefined;
  const hasExplicitName =
    rest.accessibilityLabel !== undefined ||
    rest['aria-label'] !== undefined ||
    rest.accessibilityLabelledBy !== undefined ||
    rest['aria-labelledby'] !== undefined;

  useAccessibilityLabelWarning({
    accessibilityLabel: rest.accessibilityLabel ?? rest['aria-label'],
    accessibilityLabelledBy: rest.accessibilityLabelledBy ?? rest['aria-labelledby'],
    componentName: 'Button',
    requireLabel: iconOnly,
    warning: 'Button: icon-only buttons require an accessibilityLabel that describes the action.',
  });

  const themeState = useThemeState();
  const nativeProps: PressableProps = {
    ...rest,
    ...(!hasExplicitName && { accessibilityLabel: contentLabel }),
    role: 'button',
    accessibilityState: {
      ...accessibilityState,
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: !disabled && (rest.focusable ?? true),
  };
  const [pressableProps, pressableState, focusBinding] = useFocusablePressable(nativeProps);
  const { FocusRing, ...nativeFocusProps } = useFocusVisuals({ focused: pressableState.focused && !disabled });

  const root = useSlot(Pressable, { ...pressableProps, ...nativeFocusProps, ref: rootRef });
  const leadingIcon = useOptionalSlot(Icon, leadingIconProp);
  const trailingIcon = useOptionalSlot(Icon, hasContent ? trailingIconProp : null);
  const content = useOptionalSlot(Text, contentProp);

  return {
    FocusRing,
    root,
    leadingIcon,
    trailingIcon,
    content,
    disabled,
    size,
    shape,
    iconOnly,
    fluentFallback: themeState.isFluentFallback === true,
    userStyle,
    ...themeState,
    ...pressableState,
    ...focusBinding,
    appearance: appearance ?? 'secondary',
    visualState: getButtonVisualState(disabled, pressableState.pressed, pressableState.hovered),
    themeState,
    buttonTokens: getComponentTokens(themeState, buttonTokenDefinition),
  };
}
