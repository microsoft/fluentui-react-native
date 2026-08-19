import type { Pressable, PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import type { ComponentProps, ComponentState, OptionalSlot, OwnedRootProps, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';
import type { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import type { ItemSecondaryContentPosition } from '../../common/item.types';
import type { SelectionDriverKeys, SelectionStateProps } from '../../common/selection.types';

export type MenuItemStyle = 'list-item' | 'section-header';
export type MenuItemSecondaryContentPosition = ItemSecondaryContentPosition;

export type MenuItemStateProps = {
  disabled?: boolean;
  loading?: boolean;
  hasMultiselect?: boolean;
  hasCheckmark?: boolean;
  hasChevron?: boolean;
  menuStyle?: MenuItemStyle;
  secondaryContentPosition?: MenuItemSecondaryContentPosition;
} & SelectionStateProps;

export type MenuItemSlots = {
  root: Slot<typeof Pressable>;
  icon: OptionalSlot<typeof Icon>;
  selectedIcon: OptionalSlot<typeof Icon>;
  avatar: OptionalSlot<typeof View>;
  chevron: OptionalSlot<typeof Icon>;
  checkmark: OptionalSlot<typeof Icon>;
  multiselectCheckbox: OptionalSlot<typeof CheckboxIndicator>;
};

export type MenuItemExposedPressableProps = OwnedRootProps<PressableProps>;

export type MenuItemProps = MenuItemStateProps & {
  content?: string | null;
  secondaryContent?: string | null;
} & ComponentProps<MenuItemSlots, MenuItemExposedPressableProps>;

export type MenuItemState = ComponentState<MenuItemSlots> &
  Required<Omit<MenuItemStateProps, SelectionDriverKeys>> &
  ThemeState & {
    contentText: string;
    secondaryContentText?: string | null;
    hasSecondaryContent: boolean;
    isListItem: boolean;
    isSelectedVisual: boolean;
    userStyle?: StyleProp<ViewStyle>;
    contentReserveStyle?: TextStyle;
    contentStyle?: TextStyle;
    secondaryReserveStyle?: TextStyle;
    secondaryStyle?: TextStyle;
    rootAccessibilityHint?: string;
    rootAccessibilityLabel: string;
  };
