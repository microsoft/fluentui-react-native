import type { NavItemProps } from './nav-item.types';
import { renderNavItem_unstable } from './renderNavItem';
import { useNavItem_unstable } from './useNavItem';
import { useNavItemStyles_unstable } from './useNavItemStyles';

/**
 * A NavItem navigation row component.
 */
export const NavItem = (props: NavItemProps) => {
  const state = useNavItem_unstable(props);
  useNavItemStyles_unstable(state);
  return renderNavItem_unstable(state);
};

NavItem.displayName = 'NavItem';

export default NavItem;
