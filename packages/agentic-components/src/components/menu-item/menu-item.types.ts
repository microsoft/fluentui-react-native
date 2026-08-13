import type { Pressable, PressableProps, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import type { ComponentProps, ComponentState, OptionalSlot, Slot } from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { Icon } from '../../primitives/icon/icon';

export type MenuItemStyle = 'list-item' | 'section-header';
export type MenuItemSecondaryContentPosition = 'right' | 'under';

export type MenuItemStateProps = {
  disabled?: boolean;
  loading?: boolean;
  hasMultiselect?: boolean;
  hasCheckmark?: boolean;
  hasChevron?: boolean;
  selected?: boolean;
  menuStyle?: MenuItemStyle;
  secondaryContentPosition?: MenuItemSecondaryContentPosition;
};

export type MenuItemSlots = {
  root: Slot<typeof Pressable>;
  icon: OptionalSlot<typeof Icon>;
  selectedIcon: OptionalSlot<typeof Icon>;
  avatar: OptionalSlot<typeof View>;
  chevron: OptionalSlot<typeof Icon>;
  checkmark: OptionalSlot<typeof Icon>;
  multiselectCheckbox: OptionalSlot<typeof View>;
};

export type MenuItemExposedPressableProps = Omit<PressableProps, 'children' | 'style'> & {
  style?: StyleProp<ViewStyle>;
};

export type MenuItemProps = MenuItemStateProps &
  {
    content?: string | null;
    secondaryContent?: string | null;
  } &
  ComponentProps<MenuItemSlots, MenuItemExposedPressableProps>;

export type MenuItemState = ComponentState<MenuItemSlots> &
  Required<MenuItemStateProps> &
  ThemeState & {
    contentText: string;
    secondaryContentText?: string | null;
    hasSecondaryContent: boolean;
    isListItem: boolean;
    isSelectedVisual: boolean;
    userStyle?: StyleProp<ViewStyle>;
    contentStyle: TextStyle;
    contentGhostStyle: TextStyle;
    secondaryStyle?: TextStyle;
    secondaryGhostStyle?: TextStyle;
    rootAccessibilityHint?: string;
    rootAccessibilityLabel: string;
  };
