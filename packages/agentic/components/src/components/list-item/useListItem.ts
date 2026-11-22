import { Platform, Pressable, Text as NativeText, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, useFocusablePressable, useSlot } from '@fluentui-react-native/framework-base';

import { Icon } from '../../primitives/icon/icon';
import { useFocusVisuals } from '../../common/useFocusVisuals';
import { Text } from '../text/text';

import type { ListItemProps, ListItemState } from './list-item.types';

/**
 * Hook to create the state for a ListItem component.
 */
export function useListItem_unstable(props: ListItemProps): ListItemState {
  const {
    accessibilityState,
    avatar: avatarProp,
    content: contentProp = 'List item',
    disabled = false,
    icon: iconProp,
    ref: rootRef,
    secondaryContent: secondaryContentProp,
    secondaryContentPosition = 'right',
    selected = false,
    selectedIcon: selectedIconProp,
    selectionMode = 'none',
    size = 'medium',
    style: userStyle,
    trailing: trailingProp,
    ...rest
  } = props;

  const themeState = useThemeState();
  const selectedFill = selected && selectionMode !== 'multiple' && !disabled;
  const platform: string = Platform.OS;
  const role = rest.role ?? rest.accessibilityRole ?? 'button';
  // Fabric exposes Invoke only when accessibility-tap is registered.
  // Keep button activation separate from selection/action notifications.
  const onAccessibilityTap =
    rest.onAccessibilityTap ??
    ((platform === 'windows' || platform === 'win32') && role === 'button' && rest.onPress
      ? (event?: GestureResponderEvent) => {
          if (event) rest.onPress?.(event);
        }
      : undefined);

  const [pressableProps, pressableState, focusBinding] = useFocusablePressable({
    ...rest,
    onAccessibilityTap,
    accessibilityRole: rest.accessibilityRole ?? 'button',
    accessibilityState: {
      ...accessibilityState,
      disabled,
      selected,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: !disabled && (rest.focusable ?? true),
  });

  const { FocusRing, ...nativeFocusProps } = useFocusVisuals({ focused: pressableState.focused && !disabled });

  const root = useSlot(Pressable, { ...pressableProps, ...nativeFocusProps, ref: rootRef });
  const content = useSlot(NativeText, contentProp);
  const contentHidden = useSlot(NativeText, contentProp);
  const secondaryContent = useOptionalSlot(Text, secondaryContentProp);
  const icon = useOptionalSlot(Icon, iconProp);
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp);
  const avatar = useOptionalSlot(View, avatarProp);
  const trailing = useOptionalSlot(View, trailingProp);

  return {
    FocusRing,
    root,
    content,
    contentHidden,
    secondaryContent,
    icon,
    selectedIcon,
    avatar,
    trailing,
    disabled,
    selected,
    selectionMode,
    secondaryContentPosition,
    size,
    selectedFill,
    userStyle,
    ...themeState,
    ...pressableState,
    ...focusBinding,
  };
}
