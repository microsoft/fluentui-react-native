/** @jsx withSlots */
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@fluentui-react-native/button';
import { ContextualMenu, ContextualMenuItem, SubmenuItem, Submenu } from '@fluentui-react-native/contextual-menu';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';

import {
  MenuButtonName,
  MenuButtonProps,
  MenuButtonSlotProps,
  MenuButtonType,
  MenuButtonRenderData,
  MenuButtonState,
} from './MenuButton.types';
import { View } from 'react-native';

const NativeMenuButton = ensureNativeComponent('MSFMenuButton');

export const MenuButton = compose<MenuButtonType>({
  displayName: MenuButtonName,
  usePrepareProps: (userProps: MenuButtonProps, useStyling: IUseComposeStyling<MenuButtonType>) => {
    const { menuItems, content, icon, disabled, onItemClick, contextualMenu } = userProps;

    const stdBtnRef = useRef(null);
    const [showContextualMenu, setShowContextualMenu] = useState(false);

    const onDismiss = useCallback(() => {
      setShowContextualMenu(false);
    }, [setShowContextualMenu]);

    const toggleShowContextualMenu = useCallback(() => {
      setShowContextualMenu(!showContextualMenu);
    }, [showContextualMenu, setShowContextualMenu]);

    const menuItemsUpdated = menuItems.map((item) => {
      if (item.hasSubmenu) {
        const [showSubmenu, setShowSubmenu] = useState(false);

        const toggleShowSubmenu = React.useCallback(() => {
          setShowSubmenu(!showSubmenu);
        }, [showSubmenu, setShowSubmenu]);

        const onDismissSubmenu = React.useCallback(() => {
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

    const state: MenuButtonState = {
      context: {
        showContextualMenu: !!showContextualMenu,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);

    const slotProps = mergeSettings<MenuButtonSlotProps>(styleProps, {
      root: {},
      button: {
        content,
        disabled,
        icon,
        componentRef: stdBtnRef,
        onClick: toggleShowContextualMenu,
      },
      contextualMenu: {
        onItemClick,
        target: stdBtnRef,
        onDismiss,
        setShowMenu: toggleShowContextualMenu,
        ...contextualMenu,
      },
      contextualMenuItems: {
        menuItems: menuItemsUpdated,
      },
    });

    return { slotProps, state };
  },
  slots: {
    root: React.Fragment,
    button: { slotType: Button as React.ComponentType<object> },
    contextualMenu: { slotType: ContextualMenu as React.ComponentType<object> },
    contextualMenuItems: React.Fragment,
  },
  styles: {},
  render: (Slots: ISlots<MenuButtonSlotProps>, renderData: MenuButtonRenderData) => {
    if (!(renderData.state && renderData.slotProps)) {
      return null;
    }
    const context = renderData.state!.context;
    const menuItems = renderData.slotProps!.contextualMenuItems?.menuItems || [];

    return <NativeMenuButton style={{ width: 100, height: 100 }} />;
  },
});

export default MenuButton;
