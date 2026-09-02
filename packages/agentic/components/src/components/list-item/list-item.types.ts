import type { Pressable, StyleProp, Text as NativeText, View, ViewStyle } from 'react-native';

import type { ThemeState } from '@fluentui-react-native/design';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PressableState,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';

import type { Icon } from '../../primitives/icon/icon';
import type { FocusVisualProps } from '../../primitives/focus-visual/focus-visual.types';
import type { ItemSecondaryContentPosition } from '../../common/item.types';
import type { Text } from '../text/text';

export type ListItemSize = 'small' | 'medium' | 'large';
export type ListItemSelectionMode = 'none' | 'single' | 'multiple';
export type ListItemSecondaryContentPosition = ItemSecondaryContentPosition;

export type ListItemSlots = {
  root: Slot<typeof Pressable>;
  content: Slot<typeof NativeText>;
  secondaryContent: OptionalSlot<typeof Text>;
  icon: OptionalSlot<typeof Icon>;
  selectedIcon: OptionalSlot<typeof Icon>;
  avatar: OptionalSlot<typeof View>;
  trailing: OptionalSlot<typeof View>;
};

export type ListItemStateSlots = ListItemSlots & {
  selectionIndicator: OptionalSlot<typeof NativeText>;
  contentHidden: Slot<typeof NativeText>;
};

export type ListItemStateProps = {
  disabled?: boolean;
  secondaryContentPosition?: ListItemSecondaryContentPosition;
  selectionMode?: ListItemSelectionMode;
  size?: ListItemSize;
  /**
   * Whether the component renders as selected. Selection is externally driven: the caller or the surrounding group
   * owns the value, and the component reports interactions through `onPress` rather than changing it.
   */
  selected?: boolean;
};

export type ListItemExposedPressableProps = OwnedRootProps<PropsWithRefOf<typeof Pressable>>;

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
    focusVisualProps?: FocusVisualProps;
    metrics: ListItemMetrics;
    selectedFill: boolean;
    selectionGlyph?: string;
    userStyle?: StyleProp<ViewStyle>;
  };
