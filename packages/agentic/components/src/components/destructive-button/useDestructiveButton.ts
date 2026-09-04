import type { DestructiveButtonProps, DestructiveButtonState } from './destructive-button.types';
import { useAccessibilityLabelWarning, usePressableState, useSlot, useOptionalSlot } from '@fluentui-react-native/framework-base';
import { useThemeState } from '@fluentui-react-native/design';
import { Pressable } from 'react-native';

import { disableNativeFocusRingProps, resolveFocusable } from '../../common/interaction';
import type { NativeFocusPressableProps } from '../../common/interaction';
import { Icon } from '../../primitives/icon/icon';
import { Text } from '../text/text';

function hasVisibleContent(content: DestructiveButtonProps['content']): boolean {
  if (content === undefined || content === null || (typeof content === 'string' && content.trim().length === 0)) {
    return false;
  }
  if (typeof content === 'object' && !Array.isArray(content) && 'children' in content) {
    const { children } = content as { children?: unknown };
    return !(children === undefined || children === null || (typeof children === 'string' && children.trim().length === 0));
  }
  return true;
}

/**
 * Hook to create the state for a DestructiveButton component. This is responsible for:
 * - resolving the prop states to their default values if unset
 * - setting up any accessibility for the component
 * - querying the theme state for the component
 * - initializing the component slots
 */
export function useDestructiveButton_unstable(props: DestructiveButtonProps): DestructiveButtonState {
  const {
    'aria-checked': _ariaChecked,
    'aria-selected': _ariaSelected,
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
  const hasContent = hasVisibleContent(contentProp);
  const hasIcon = iconProp !== undefined && iconProp !== null;
  const iconOnly = !hasContent && hasIcon;
  const resolvedAccessibilityState = { ...accessibilityState };
  delete resolvedAccessibilityState.checked;
  delete resolvedAccessibilityState.selected;

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
    ...disableNativeFocusRingProps,
    role: 'button',
    accessibilityState: {
      ...resolvedAccessibilityState,
      disabled,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: resolveFocusable(rest.focusable, disabled),
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
