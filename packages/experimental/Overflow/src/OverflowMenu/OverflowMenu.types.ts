import type { LayoutChangeEvent, View } from 'react-native';

export const overflowMenuName = 'OverflowMenu';

export interface OverflowMenuState {
  /** Flag for whether the menu should be showing */
  showMenu: boolean;
  /** Map of overflow items and their visibility in their menu - true means they should show as menu items */
  menuItemVisibilities: Record<string, boolean>;
  /** Component ref to attach to this OverflowMenu's trigger */
  menuRef: React.RefObject<View>;
  /** Callback for RN onLayout event */
  onLayout: (e: LayoutChangeEvent) => void;
}
