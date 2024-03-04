import type { LayoutChangeEvent, View } from 'react-native';

export const overflowMenuName = 'OverflowMenu';

export interface OverflowMenuState {
  showMenu: boolean;
  menuItems: string[];
  menuRef: React.RefObject<View>;
  onLayout: (e: LayoutChangeEvent) => void;
}
