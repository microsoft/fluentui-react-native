import type { MenuProps } from './menu.types';
import { useMenu_unstable } from './useMenu';
import { useMenuStyles_unstable } from './useMenuStyles';
import { renderMenu_unstable } from './renderMenu';

/**
 * A command menu of MenuItem rows and Dividers in a nonmodal native popup anchored to a trigger Button, with up to two
 * levels of submenus.
 */
export const Menu = (props: MenuProps) => {
  const state = useMenu_unstable(props);
  useMenuStyles_unstable(state);
  return renderMenu_unstable(state);
};
Menu.displayName = 'Menu';

export default Menu;
