import type { LayoutChangeEvent, View } from 'react-native';

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
