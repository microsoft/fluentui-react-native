import type * as React from 'react';
import type { FocusTargetBinding } from '@fluentui-react-native/framework-base';
import type { Pressable, StyleProp, TextStyle, View, ViewStyle } from 'react-native';
import type {
  ComponentProps,
  ComponentState,
  OptionalSlot,
  OwnedRootProps,
  PropsWithRefOf,
  Slot,
} from '@fluentui-react-native/framework-base';
import type { ThemeState } from '@fluentui-react-native/design';

import type { FocusVisualsSlots } from '../../common/useFocusVisuals';
import type { Icon } from '../../primitives/icon/icon';
import type { CheckboxIndicator } from '../../primitives/checkbox-indicator/checkbox-indicator';
import type { ItemSecondaryContentPosition } from '../../common/item.types';

export type MenuItemStyle = 'list-item' | 'section-header';

/**
 * A submenu declared by a list row inside a Menu: View props with `ref` for the submenu surface, plus its MenuItem and
 * Divider rows. The surface is the native popup's content attachment, so it cannot be replaced.
 */
export type MenuItemSubmenuProps = Omit<PropsWithRefOf<typeof View>, 'children' | 'collapsable'> & {
  children: React.ReactNode;
};
export type MenuItemSecondaryContentPosition = ItemSecondaryContentPosition;

export type MenuItemStateProps = {
  disabled?: boolean;
  /** Keep a disabled list row focusable without allowing activation. Headers remain nonfocusable. */
  disabledFocusable?: boolean;
  loading?: boolean;
  hasMultiselect?: boolean;
  hasCheckmark?: boolean;
  hasChevron?: boolean;
  menuStyle?: MenuItemStyle;
  secondaryContentPosition?: MenuItemSecondaryContentPosition;
  /**
   * Whether the component renders as selected. Selection is externally driven: the caller or the surrounding group
   * owns the value, and the component reports interactions through `onPress` rather than changing it.
   */
  selected?: boolean;
};

export type MenuItemSlots = {
  root: Slot<typeof Pressable>;
  icon: OptionalSlot<typeof Icon>;
  selectedIcon: OptionalSlot<typeof Icon>;
  avatar: OptionalSlot<typeof View>;
  chevron: OptionalSlot<typeof Icon>;
  checkmark: OptionalSlot<typeof Icon>;
  multiselectCheckbox: OptionalSlot<typeof CheckboxIndicator>;
};

export type MenuItemExposedPressableProps = OwnedRootProps<PropsWithRefOf<typeof Pressable>>;

export type MenuItemProps = MenuItemStateProps & {
  content?: string | null;
  secondaryContent?: string | null;
  /** Inside a Menu, the submenu this row opens. Outside a Menu it renders no popup. */
  submenu?: MenuItemSubmenuProps;
} & ComponentProps<MenuItemSlots, MenuItemExposedPressableProps>;

export type MenuItemState = ComponentState<MenuItemSlots & FocusVisualsSlots> &
  FocusTargetBinding &
  Required<MenuItemStateProps> &
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
    /** The row's identity within its Menu, or undefined for a standalone row. */
    menuRowId?: string;
  };
