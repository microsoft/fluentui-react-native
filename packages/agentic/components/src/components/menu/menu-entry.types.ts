import type * as React from 'react';
import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
import type { DistributiveOmit, FocusKeyboardEvent } from '@fluentui-react-native/framework-base';
import type { MenuItemProps, MenuItemSlots, MenuItemState } from '../menu-item/menu-item.types';
import type { MenuContentProps } from './menu.types';
import type { PopoverCommittedAnchor } from '../popover/popover.types';
import type { MenuScope } from './menu.controller';

export type MenuCheckable = 'radio' | 'checkbox';
export type MenuActionEvent =
  | Parameters<NonNullable<PressableProps['onPress']>>[0]
  | Parameters<NonNullable<PressableProps['onAccessibilityAction']>>[0];
export type MenuSubmenuContent = {
  surfaceAccessibilityLabel: string;
  content?: MenuContentProps | null;
};
type EntryBase = DistributiveOmit<
  MenuItemProps,
  | 'content'
  | 'children'
  | 'menuStyle'
  | 'loading'
  | 'hasChevron'
  | 'hasCheckmark'
  | 'hasMultiselect'
  | 'selected'
  | 'role'
  | 'accessibilityRole'
  | 'focusable'
  | 'accessible'
  | 'root'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'keyDownEvents'
  | 'keyUpEvents'
  | 'validKeysDown'
  | 'validKeysUp'
  | 'tabIndex'
  | 'aria-disabled'
  | 'aria-checked'
  | 'aria-expanded'
  | 'style'
> & {
  itemId: string;
  content: string;
  textValue?: string;
  style?: StyleProp<ViewStyle>;
  onKeyDown?: (event: FocusKeyboardEvent) => void;
  onKeyUp?: (event: FocusKeyboardEvent) => void;
};
type Command = {
  checkable?: never;
  selectionGroup?: never;
  selected?: boolean;
  submenu?: never;
  submenuOpen?: never;
  defaultSubmenuOpen?: never;
  onSubmenuOpenChange?: never;
  /** Original press/action event, or undefined for genuine eventless macOS AX activation. */
  onAction?: (event?: MenuActionEvent) => void;
};
type Choice = {
  selected: boolean;
  submenu?: never;
  submenuOpen?: never;
  defaultSubmenuOpen?: never;
  onSubmenuOpenChange?: never;
  onAction?: (event?: MenuActionEvent) => void;
} & ({ checkable: 'radio'; selectionGroup: string } | { checkable: 'checkbox'; selectionGroup?: never });
type Submenu = {
  submenu: MenuSubmenuContent;
  submenuOpen?: boolean;
  defaultSubmenuOpen?: boolean;
  onSubmenuOpenChange?: (open: boolean) => void;
  checkable?: never;
  selectionGroup?: never;
  selected?: never;
  onAction?: never;
};
export type MenuEntryProps = EntryBase & (Command | Choice | Submenu);
export type MenuEntrySlots = MenuItemSlots;
export type MenuEntryState = MenuItemState & {
  itemId: string;
  scope: MenuScope;
  rowRef: React.RefCallback<import('react-native').View>;
  submenu?: MenuSubmenuContent;
  submenuOpen: boolean;
  requestSubmenu: (open: boolean) => void;
  anchor: PopoverCommittedAnchor | null;
};
