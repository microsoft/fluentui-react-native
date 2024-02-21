import type { ButtonProps } from '@fluentui-react-native/button';
import type { MenuProps } from '@fluentui-react-native/menu';

export const overflowMenuName = 'OverflowMenu';

export interface OverflowMenuState {
  showMenu: boolean;
  menuItems: string[];
}

export type OverflowMenuProps = MenuProps & {
  buttonProps?: ButtonProps;
};

export interface OverflowMenuInfo {
  props: OverflowMenuProps;
  state: OverflowMenuState;
}
