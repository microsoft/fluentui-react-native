import { Pressable, Text as NativeText, View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useOptionalSlot, usePressableState, useSlot } from '@fluentui-react-native/framework-base';

import { Icon } from '../../primitives/icon/icon';
import { hideSlotProps } from '../../common/accessibility';
import { Text } from '../text/text';

import { getListItemAvatarSize, getListItemIconSize, getListItemSelectionIndicatorGlyph } from './list-item.styles';
import type { ListItemMetrics, ListItemProps, ListItemState } from './list-item.types';

function getMetrics(size: ListItemState['size'], tokens: ListItemState['tokens']): ListItemMetrics {
  const { spacing } = tokens;
  switch (size) {
    case 'small':
      return {
        contentGap: spacing.componentBase100,
        leadingContentMargin: spacing.componentBase100,
        rootPaddingHorizontal: spacing.componentBase200,
        rootPaddingVertical: spacing.componentBase150,
        selectionIndicatorMargin: spacing.componentBase150,
        selectionIndicatorSize: getListItemIconSize(size),
        trailingGap: spacing.componentBase100,
        trailingMargin: spacing.componentBase150,
        avatarSize: getListItemAvatarSize(size),
        iconSize: getListItemIconSize(size),
      };
    case 'large':
      return {
        contentGap: spacing.componentBase100,
        leadingContentMargin: spacing.componentBase200,
        rootPaddingHorizontal: spacing.componentBase400,
        rootPaddingVertical: spacing.componentBase300,
        selectionIndicatorMargin: spacing.componentBase200,
        selectionIndicatorSize: getListItemIconSize(size),
        trailingGap: spacing.componentBase100,
        trailingMargin: spacing.componentBase250,
        avatarSize: getListItemAvatarSize(size),
        iconSize: getListItemIconSize(size),
      };
    case 'medium':
    default:
      return {
        contentGap: spacing.componentBase100,
        leadingContentMargin: spacing.componentBase150,
        rootPaddingHorizontal: spacing.componentBase300,
        rootPaddingVertical: spacing.componentBase250,
        selectionIndicatorMargin: spacing.componentBase200,
        selectionIndicatorSize: getListItemIconSize(size),
        trailingGap: spacing.componentBase100,
        trailingMargin: spacing.componentBase200,
        avatarSize: getListItemAvatarSize(size),
        iconSize: getListItemIconSize(size),
      };
  }
}

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
  const metrics = getMetrics(size, themeState.tokens);
  const selectedFill = selected && selectionMode !== 'multiple' && !disabled;
  const selectionGlyph = selectionMode === 'none' ? undefined : getListItemSelectionIndicatorGlyph(selected, selectionMode);

  const [pressableProps, pressableState] = usePressableState({
    ...rest,
    accessibilityRole: rest.accessibilityRole ?? 'button',
    accessibilityState: {
      ...accessibilityState,
      disabled,
      selected,
    },
    accessible: rest.accessible ?? true,
    disabled,
    focusable: rest.focusable ?? !disabled,
  });

  const root = useSlot(Pressable, { ...pressableProps, ref: rootRef });
  const content = useSlot(NativeText, contentProp);
  const contentHidden = useSlot(NativeText, contentProp);
  const secondaryContent = useOptionalSlot(Text, secondaryContentProp);
  const icon = useOptionalSlot(Icon, iconProp);
  const selectedIcon = useOptionalSlot(Icon, selectedIconProp);
  const avatar = useOptionalSlot(View, avatarProp);
  const trailing = useOptionalSlot(View, trailingProp);
  const selectionIndicator = useOptionalSlot(NativeText, selectionGlyph, { transform: hideSlotProps });

  return {
    root,
    content,
    contentHidden,
    secondaryContent,
    icon,
    selectedIcon,
    avatar,
    trailing,
    selectionIndicator,
    disabled,
    selected,
    selectionMode,
    secondaryContentPosition,
    size,
    metrics,
    selectedFill,
    selectionGlyph,
    userStyle,
    ...themeState,
    ...pressableState,
  };
}
