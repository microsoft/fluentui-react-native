import { useMenu_unstable } from './useMenu';
import { useMenuStyles_unstable } from './useMenuStyles';
import { renderMenu_unstable } from './renderMenu';
import type { MenuProps } from './menu.types';

export const Menu = (props: MenuProps) => {
  const state = useMenu_unstable(props);
  const styles = useMenuStyles_unstable(state);
  return renderMenu_unstable(state, styles);
};
Menu.displayName = 'Menu';
