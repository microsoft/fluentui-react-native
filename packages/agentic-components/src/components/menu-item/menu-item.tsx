import type { MenuItemProps } from './menu-item.types';
import { useMenuItem_unstable } from './useMenuItem';
import { useMenuItemStyles_unstable } from './useMenuItemStyles';
import { renderMenuItem_unstable } from './renderMenuItem';

export const MenuItem = (props: MenuItemProps) => {
  const state = useMenuItem_unstable(props);
  useMenuItemStyles_unstable(state);
  return renderMenuItem_unstable(state);
};

MenuItem.displayName = 'MenuItem';

export default MenuItem;
