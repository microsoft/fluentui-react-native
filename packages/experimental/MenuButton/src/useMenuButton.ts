import { useRef, useCallback, useState } from 'react';
import { MenuButtonProps, MenuButtonInfo } from './MenuButton.types';

export const useMenuButton = (props: MenuButtonProps): MenuButtonInfo => {
  const { menuItems, content, icon, disabled, onItemClick, contextualMenu, primary } = props;

  const stdBtnRef = useRef(null);
    const [showContextualMenu, setShowContextualMenu] = useState(false);
    const onDismiss = useCallback(() => {
      setShowContextualMenu(false);
    }, [setShowContextualMenu]);
    const toggleShowContextualMenu = useCallback(() => {
      setShowContextualMenu(!showContextualMenu);
    }, [showContextualMenu, setShowContextualMenu]);

    const buttonProps = {
      content,
      disabled,
      primary,
      icon,
      componentRef: stdBtnRef,
      onClick: toggleShowContextualMenu,
    };

    const contextualMenuProps = {
      onItemClick,
      target: stdBtnRef,
      onDismiss,
      setShowMenu: toggleShowContextualMenu,
      ...contextualMenu,
    };

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

  return {
    props: {
      ...buttonProps,
      contextualMenu: contextualMenuProps,
      menuItems: menuItemsUpdated,
      onItemClick,
    },
    state: {
      showContextualMenu
    }
  };
};
