import type { MenuItemProps } from './menu-item.types';
import { useMenuItem_unstable } from './useMenuItem';
import { useApplyStyles_unstable } from './useApplyStyles';
import { renderMenuItem_unstable } from './renderMenuItem';

export const MenuItem = (props: MenuItemProps) => {
  const state = useMenuItem_unstable(props);
  useApplyStyles_unstable(state);
  return renderMenuItem_unstable(state);
};

MenuItem.displayName = 'MenuItem';

export default MenuItem;
