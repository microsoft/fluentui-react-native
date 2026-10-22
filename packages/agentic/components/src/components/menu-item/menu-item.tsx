/** @jsxImportSource @fluentui-react-native/framework-base */
import * as React from 'react';

import type { MenuItemProps } from './menu-item.types';
import { MenuItemMenuContext } from './menuItemContext';
import { useMenuItem_unstable } from './useMenuItem';
import { useMenuItemStyles_unstable } from './useMenuItemStyles';
import { renderMenuItem_unstable } from './renderMenuItem';

function MenuItemRow(props: MenuItemProps) {
  const state = useMenuItem_unstable(props);
  useMenuItemStyles_unstable(state);
  return renderMenuItem_unstable(state);
}

export const MenuItem = (props: MenuItemProps) => {
  const menu = React.useContext(MenuItemMenuContext);
  // A Menu renders a submenu row together with its popup; MenuItem itself never depends on Menu.
  const Row = menu && props.submenu && (props.menuStyle ?? 'list-item') === 'list-item' ? menu.SubmenuRow : MenuItemRow;
  return <Row {...props} />;
};

MenuItem.displayName = 'MenuItem';

export default MenuItem;
