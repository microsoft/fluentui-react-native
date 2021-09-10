/** @jsx withSlots */
import React, { useRef, useState, useCallback } from 'react';
import { PrimaryButton, Button } from '@fluentui-react-native/button';
import { ContextualMenu, ContextualMenuItem, SubmenuItem, Submenu } from '@fluentui-react-native/contextual-menu';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { backgroundColorTokens, borderTokens } from '@fluentui-react-native/tokens';
import { Svg, Path } from 'react-native-svg';
import { defaultIconColor, primaryIconColor } from './MenuButton.style';

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

    const menuItemsUpdated = menuItems.map(item => {
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
          showSubmenu: item.showSubmenu ? showSubmenu : undefined,
          submenuProps: { ...restSubmenuProps, onDismiss, setShowMenu },
        };
        return menuItemUpdated;
      }
      return item;
    });

    const state: MenuButtonState = {
      context: {
        showContextualMenu: !!showContextualMenu,
        primary: !!primary,
      },
    };

    const styleProps = useStyling(userProps, (override: string) => state[override] || userProps[override]);
    const buttonProps = {
      content,
      disabled,
      startIcon,
      componentRef: stdBtnRef,
      onClick: toggleShowContextualMenu,
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
      chevronSvg: {
        width: '12',
        height: '16',
        viewBox: '0 0 11 6',
        color: primary ? primaryIconColor : defaultIconColor,
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
    chevronSvg: Svg,
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
    const menuItems = renderData.slotProps!.contextualMenuItems ? renderData.slotProps!.contextualMenuItems.menuItems : [];

    const chevronIcon = () => {
      const chevronPath = `M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z`;
      return (
        <Slots.chevronSvg>
          <Path fill="currentColor" d={chevronPath} />
        </Slots.chevronSvg>
      );
    };
    return (
      <Slots.root>
        {context.primary ? <Slots.primaryButton>{chevronIcon()}</Slots.primaryButton> : <Slots.button>{chevronIcon()}</Slots.button>}
        {context.showContextualMenu && (
          <Slots.contextualMenu>
            {menuItems.map(menuItem => {
              const { hasSubmenu, submenuProps, showSubmenu, componentRef, submenuItems, ...items } = menuItem;

              return hasSubmenu && submenuItems ? (
                <Slots.contextualMenuItems>
                  <SubmenuItem componentRef={componentRef} {...items} />
                  {showSubmenu && (
                    <Submenu target={componentRef} {...submenuProps}>
                      {submenuItems.map(submenuItem => (
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
