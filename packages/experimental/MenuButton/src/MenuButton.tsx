/** @jsx withSlots */
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@fluentui-react-native/experimental-button';
import { compose, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { stylingSettings } from './MenuButton.styling';
import { renderContextualMenu } from './renderContextualMenu';
import { SvgXml } from 'react-native-svg';

import { menuButtonName, MenuButtonProps, MenuButtonType } from './MenuButton.types';

const defaultIconColor = '#616161';
const primaryIconColor = '#ffffff';

export const MenuButton = compose<MenuButtonType>({
  displayName: menuButtonName,
  ...stylingSettings,
  slots: {
    root: React.Fragment,
    chevronIcon: SvgXml,
  },
  slotProps: {
    root: {},
  },
  render: (props: MenuButtonProps, useSlots: UseSlots<MenuButtonType>) => {
    const { menuItems, content, icon, disabled, onItemClick, contextualMenu, style, appearance, ...rest } = props;

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
      appearance,
      icon,
      style,
      ref: stdBtnRef,
      onClick: toggleShowContextualMenu,
      ...rest,
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

    const Slots = useSlots(props);

    return () => {
      const chevronColor = appearance === 'primary' ? primaryIconColor : defaultIconColor;
      const chevronXml = `
          <svg width="12" height="16" viewBox="0 0 11 6" color=${chevronColor}>
            <path fill='currentColor' d='M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z' />
          </svg>`;
      const { content, ...restButtonProps } = buttonProps;

      return (
        <Slots.root>
          <Button {...restButtonProps}>
            {content}
            <Slots.chevronIcon xml={chevronXml} />
          </Button>
          {showContextualMenu && renderContextualMenu(contextualMenuProps, menuItemsUpdated)}
        </Slots.root>
      );
    };
  },
});
