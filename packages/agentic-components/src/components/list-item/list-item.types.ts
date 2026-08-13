import type { Pressable, PressableProps, StyleProp, Text, View, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type { ComponentProps, ComponentState, OptionalSlot, PressableState, Slot } from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';

export type ListItemSize = 'small' | 'medium' | 'large';
export type ListItemSelectionMode = 'none' | 'single' | 'multiple';
export type ListItemSecondaryContentPosition = 'right' | 'under';

export type ListItemSlots = {
  root: Slot<typeof Pressable>;
  content: Slot<typeof Text>;
  secondaryContent: OptionalSlot<typeof Text>;
  icon: OptionalSlot<typeof Icon>;
  selectedIcon: OptionalSlot<typeof Icon>;
  avatar: OptionalSlot<typeof View>;
  trailing: OptionalSlot<typeof View>;
};

export type ListItemStateSlots = ListItemSlots & {
  selectionIndicator: OptionalSlot<typeof Text>;
  contentHidden: Slot<typeof Text>;
};

export type ListItemStateProps = {
  disabled?: boolean;
  selected?: boolean;
  secondaryContentPosition?: ListItemSecondaryContentPosition;
  selectionMode?: ListItemSelectionMode;
  size?: ListItemSize;
};

export type ListItemExposedPressableProps = Omit<PressableProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export type ListItemProps = ListItemStateProps & ComponentProps<ListItemSlots, ListItemExposedPressableProps>;

export type ListItemMetrics = {
  contentGap: number;
  leadingContentMargin: number;
  rootPaddingHorizontal: number;
  rootPaddingVertical: number;
  selectionIndicatorMargin: number;
  selectionIndicatorSize: number;
  trailingMargin: number;
  trailingGap: number;
  avatarSize: number;
  iconSize: number;
};

export type ListItemState = ComponentState<ListItemStateSlots> &
  Required<ListItemStateProps> &
  ThemeState &
  PressableState & {
    metrics: ListItemMetrics;
    selectedFill: boolean;
    selectionGlyph?: string;
    userStyle?: StyleProp<ViewStyle>;
  };
