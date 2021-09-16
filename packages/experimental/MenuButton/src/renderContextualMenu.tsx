/* @jsxFrag React.Fragment */
import React from 'react';
import { ContextualMenu, ContextualMenuItem, SubmenuItem, Submenu, ContextualMenuProps } from '@fluentui-react-native/contextual-menu';
import { MenuButtonItemProps } from './MenuButton.types'

export const renderContextualMenu = (contextualMenu: ContextualMenuProps, menuItems: MenuButtonItemProps[]): JSX.Element => {
    return (<ContextualMenu {...contextualMenu}>
          {menuItems?.map((menuItem) => {
              const { hasSubmenu, submenuProps, showSubmenu, componentRef, submenuItems, ...items } = menuItem;
              return hasSubmenu ? (
                <>
                  <SubmenuItem componentRef={componentRef} {...items} />
                  {showSubmenu && (
                    <Submenu target={componentRef} {...submenuProps}>
                      {submenuItems?.map((submenuItem) => (
                        <ContextualMenuItem key={submenuItem.itemKey} {...submenuItem} />
                      ))}
                    </Submenu>
                  )}
                </>
              ) : (
                <ContextualMenuItem key={items.itemKey} {...items} />
              );
            })}
        </ContextualMenu>)
};