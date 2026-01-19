/** @jsxRuntime classic */
import * as React from 'react';

import type { ContextualMenuProps } from '@fluentui-react-native/contextual-menu';
import { ContextualMenu, ContextualMenuItem, SubmenuItem, Submenu } from '@fluentui-react-native/contextual-menu';

import type { MenuButtonItemProps } from './MenuButton.types';

export const renderContextualMenu = (contextualMenu: ContextualMenuProps, menuItems: MenuButtonItemProps[]): JSX.Element => {
  return (
    <ContextualMenu {...contextualMenu}>
      {menuItems?.map((menuItem) => {
        return menuItem.hasSubmenu ? <SubMenuItem {...menuItem} /> : <ContextualMenuItem key={menuItem.itemKey} {...menuItem} />;
      })}
    </ContextualMenu>
  );
};

const SubMenuItem: React.FunctionComponent<MenuButtonItemProps> = (props: MenuButtonItemProps): JSX.Element => {
  const [showSubmenuState, setShowSubmenu] = React.useState(false);
  const toggleShowSubmenu = React.useCallback(() => {
    setShowSubmenu(!showSubmenuState);
  }, [showSubmenuState, setShowSubmenu]);
  const onDismissSubmenu = React.useCallback(() => {
    setShowSubmenu(false);
  }, [setShowSubmenu]);

  const { showSubmenu = showSubmenuState, submenuProps, componentRef, submenuItems, onHoverIn = toggleShowSubmenu, ...restItems } = props;
  const { onDismiss = onDismissSubmenu, setShowMenu = toggleShowSubmenu, ...restSubmenuProps } = submenuProps;

  return (
    <>
      <SubmenuItem componentRef={componentRef} onHoverIn={onHoverIn} {...restItems} />
      {showSubmenu && (
        <Submenu target={componentRef} onDismiss={onDismiss} setShowMenu={setShowMenu} {...restSubmenuProps}>
          {submenuItems?.map((submenuItem) => (
            <ContextualMenuItem key={submenuItem.itemKey} {...submenuItem} />
          ))}
        </Submenu>
      )}
    </>
  );
};
