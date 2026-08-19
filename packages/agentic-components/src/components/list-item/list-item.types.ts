import type { Pressable, PressableProps, StyleProp, Text, View, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';
import type { ItemSecondaryContentPosition } from '../../common/item.types';
import type { SelectionDriverKeys, SelectionStateProps } from '../../common/selection.types';

export type ListItemSize = 'small' | 'medium' | 'large';
export type ListItemSelectionMode = 'none' | 'single' | 'multiple';
export type ListItemSecondaryContentPosition = ItemSecondaryContentPosition;

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
  secondaryContentPosition?: ListItemSecondaryContentPosition;
  selectionMode?: ListItemSelectionMode;
  size?: ListItemSize;
} & SelectionStateProps;

export type ListItemExposedPressableProps = OwnedRootProps<PressableProps>;

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
  Required<Omit<ListItemStateProps, SelectionDriverKeys>> &
  ThemeState &
  PressableState & {
    metrics: ListItemMetrics;
    selectedFill: boolean;
    selectionGlyph?: string;
    userStyle?: StyleProp<ViewStyle>;
  };
