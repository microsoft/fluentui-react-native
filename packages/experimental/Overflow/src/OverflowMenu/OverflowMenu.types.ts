import type { LayoutChangeEvent, View } from 'react-native';

export const overflowMenuName = 'OverflowMenu';

export interface OverflowMenuState {
  // Flag for whether the menu should be showing
  showMenu: boolean;
  // Menu items that should be shown in the dropdown - corresponds to which overflow items are hidden
  menuItems: string[];
  // Component ref to attach to this OverflowMenu's trigger
  menuRef: React.RefObject<View>;
  // Callback for RN onLayout event
  onLayout: (e: LayoutChangeEvent) => void;
}
