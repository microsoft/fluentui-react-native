/** @jsx withSlots */
import React, { useRef, useState, useCallback } from 'react';
import { PrimaryButton, Button } from '@fluentui-react-native/button';
import { ContextualMenu, ContextualMenuItem, SubmenuItem, Submenu } from '@fluentui-react-native/contextual-menu';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import chevronIconSvg from './chevron.svg';

import {
  MenuButtonName,
  MenuButtonProps,
  MenuButtonSlotProps,
  MenuButtonType,
  MenuButtonRenderData,
  MenuButtonState,
} from './MenuButton.types';

export const MenuButton = compose<MenuButtonType>({
  displayName: MenuButtonName,
  usePrepareProps: (userProps: MenuButtonProps, useStyling: IUseComposeStyling<MenuButtonType>) => {
    const { menuItems, content, startIcon, disabled, onItemClick, contextualMenu, primary } = userProps;

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
        primary: !!primary
      },
    };

    const chevronIconProps = {
      svgSource: {
        src: chevronIconSvg
      },
      width: 12,
      height: 16,
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);
    const buttonProps = {
      content,
      disabled,
      startIcon,
      componentRef: stdBtnRef,
      onClick: toggleShowContextualMenu,
      endIcon: chevronIconProps,
    };

    const slotProps = mergeSettings<MenuButtonSlotProps>(styleProps, {
      root: {},
      button: buttonProps,
      primaryButton: buttonProps,
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
    button: { slotType: Button as React.ComponentType },
    primaryButton: { slotType: PrimaryButton as React.ComponentType },
    contextualMenu: { slotType: ContextualMenu as React.ComponentType },
    contextualMenuItems: React.Fragment,
  },
  styles: {
    contextualMenu: [backgroundColorTokens, borderTokens],
    button: [backgroundColorTokens, borderTokens],
  },
  render: (Slots: ISlots<MenuButtonSlotProps>, renderData: MenuButtonRenderData) => {
    if (!(renderData.state && renderData.slotProps)) {
      return null;
    }
    const context = renderData.state!.context;
    const menuItems = renderData.slotProps!.contextualMenuItems?.menuItems || [];

    return (
      <Slots.root>
        {
          context.primary ?
          <Slots.primaryButton /> : <Slots.button />
        }
        {context.showContextualMenu && (
          <Slots.contextualMenu>
            {menuItems.map((menuItem) => {
              const { hasSubmenu, submenuProps, showSubmenu, componentRef, submenuItems, ...items } = menuItem;

              return hasSubmenu ? (
                <Slots.contextualMenuItems>
                  <SubmenuItem componentRef={componentRef} {...items} />
                  {showSubmenu && (
                    <Submenu target={componentRef} {...submenuProps}>
                      {submenuItems?.map((submenuItem) => (
                        <ContextualMenuItem key={submenuItem.itemKey} {...submenuItem} />
                      ))}
                    </Submenu>
                  )}
                </Slots.contextualMenuItems>
              ) : (
                <ContextualMenuItem key={items.itemKey} {...items} />
              );
            })}
          </Slots.contextualMenu>
        )}
      </Slots.root>
    );
  },
});

export default MenuButton;
