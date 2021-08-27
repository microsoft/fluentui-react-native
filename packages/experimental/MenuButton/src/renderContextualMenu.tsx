/* @jsxFrag React.Fragment */
import React, { useState, useCallback } from 'react';
import { ContextualMenu, ContextualMenuItem, SubmenuItem, Submenu, ContextualMenuProps } from '@fluentui-react-native/contextual-menu';
import { MenuButtonItemProps } from './MenuButton.types'

export const renderContextualMenu = (contextualMenu: ContextualMenuProps, menuItems: MenuButtonItemProps[]): JSX.Element => {
    const menuItemsUpdated = menuItems?.map((item) => {
      if (item.hasSubmenu) {
        const [showSubmenu, setShowSubmenu] = useState(false);
        const toggleShowSubmenu = useCallback(() => {
          setShowSubmenu(!showSubmenu);
        }, [showSubmenu, setShowSubmenu]);
        const onDismissSubmenu = useCallback(() => {
          setShowSubmenu(false);
        }, [setShowSubmenu]);
        const { onHoverIn = toggleShowSubmenu, submenuProps = {}, ...restItems } = item;
        const { onDismiss = onDismissSubmenu, setShowMenu = toggleShowSubmenu, ...restSubmenuProps } = submenuProps;
        const menuItemUpdated = {
          ...restItems,
          onHoverIn,
          showSubmenu: item.showSubmenu ?? showSubmenu,
          submenuProps: { ...restSubmenuProps, onDismiss, setShowMenu },
        };
        return menuItemUpdated;
      }
      return item;
    });

    return (<ContextualMenu {...contextualMenu}>
          {menuItemsUpdated?.map((menuItem) => {
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