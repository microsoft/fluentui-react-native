import type { LayoutChangeEvent, View } from 'react-native';

import type { ButtonProps } from '@fluentui-react-native/button';
import type { MenuProps, MenuItemProps } from '@fluentui-react-native/menu';

export const overflowMenuName = 'OverflowMenu';

export interface OverflowMenuState {
  /** Flag for whether the menu should be showing */
  showMenu: boolean;
  /** Map of overflow items and their visibility in their menu - true means they should show as menu items */
  visibleMenuItems: string[];
  /** Component ref to attach to this OverflowMenu's trigger */
  menuTriggerRef: React.RefObject<View>;
  /** Callback for RN onLayout event */
  onMenuTriggerLayout: (e: LayoutChangeEvent) => void;
}

export interface OverflowMenuProps {
  /** Props for the menu itself */
  menuProps?: MenuProps;
  /** Props for the menu trigger */
  triggerProps?: ButtonProps;
  /** Function that maps an overflowID to the menu item props it will render */
  mapMenuItemProps?: (overflowID: string) => MenuItemProps;
}
