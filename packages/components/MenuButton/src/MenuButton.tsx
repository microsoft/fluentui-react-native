/** @jsx withSlots */
import React, {useRef, useState, useCallback} from 'react';
import { Button } from '@fluentui-react-native/button';
import { ContextualMenu, ContextualMenuItem } from '@fluentui-react-native/contextual-menu';
import { IUseComposeStyling, compose } from '@uifabricshared/foundation-compose';
import { mergeSettings } from '@uifabricshared/foundation-settings';
import { ISlots, withSlots } from '@uifabricshared/foundation-composable';
import { View } from 'react-native';

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
    const { menuItems, content, icon, disabled, onItemClick, contextualMenu } = userProps;

    const stdBtnRef = useRef(null);
    const [showContextualMenu, setShowContextualMenu] = useState(false);

    const onDismiss = useCallback(() => {
      setShowContextualMenu(false);
    }, [setShowContextualMenu]);

    const toggleShowContextualMenu = useCallback(() => {
      setShowContextualMenu(!showContextualMenu);
    }, [showContextualMenu, setShowContextualMenu]);

    const state: MenuButtonState = {
      context: {
        showContextualMenu: !!showContextualMenu
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
        onClick: toggleShowContextualMenu
      },
      contextualMenu: {
        onItemClick,
        target: stdBtnRef,
        onDismiss,
        setShowMenu: toggleShowContextualMenu,
        ...contextualMenu
      },
      contextualMenuItems: {
        menuItems
      },
      ContextualMenuItem
    });

    return { slotProps, state };
  },
  slots: {
    root: React.Fragment,
    button: { slotType: Button as React.ComponentType<object> },
    contextualMenu: { slotType: ContextualMenu as React.ComponentType<object> },
    contextualMenuItems: View
  },
  styles: {},
  render: (Slots: ISlots<MenuButtonSlotProps>, renderData: MenuButtonRenderData) => {
    if (!(renderData.state && renderData.slotProps)) {
      return null;
    }
    const context = renderData.state!.context;
    const menuItems = renderData.slotProps!.contextualMenuItems && renderData.slotProps.contextualMenuItems.menuItems || [];

    return (
      <Slots.root>
        <Slots.button />
        {
          context.showContextualMenu && (
            <Slots.contextualMenu>
              {menuItems.map(menuItem => <ContextualMenuItem key={menuItem.itemKey} {...menuItem} />)}
            </Slots.contextualMenu>
          )
        }
      </Slots.root>
    );
  },
});

export default MenuButton