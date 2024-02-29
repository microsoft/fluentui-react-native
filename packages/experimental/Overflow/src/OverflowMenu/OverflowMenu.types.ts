import type { LayoutChangeEvent, View } from 'react-native';

import type { ButtonProps } from '@fluentui-react-native/button';
import type { MenuProps } from '@fluentui-react-native/menu';

export const overflowMenuName = 'OverflowMenu';

export interface OverflowMenuState {
  showMenu: boolean;
  menuItems: string[];
  menuRef: React.RefObject<View>;
  onLayout: (e: LayoutChangeEvent) => void;
}

export type OverflowMenuProps = MenuProps & {
  buttonProps?: ButtonProps;
  getMenuItemLabel?: (overflowID: string) => string;
};

export interface OverflowMenuInfo {
  props: OverflowMenuProps;
  state: OverflowMenuState;
}
