/** @jsx withSlots */
import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@fluentui-react-native/experimental-button';
import { compose, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import { stylingSettings } from './MenuButton.styling';
import ChevronIconSvg from './chevron.svg';
import { renderContextualMenu } from './renderContextualMenu';

import { menuButtonName, MenuButtonProps, MenuButtonType } from './MenuButton.types';

export const MenuButton = compose<MenuButtonType>({
  displayName: menuButtonName,
  ...stylingSettings,
  slots: {
    root: React.Fragment,
    chevronIcon: Icon,
  },
  slotProps: {
    root: {},
    chevronIcon: {
      svgSource: {
        src: ChevronIconSvg,
      },
      width: 12,
      height: 16,
    },
  },
  render: (props: MenuButtonProps, useSlots: UseSlots<MenuButtonType>) => {
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

    const Slots = useSlots(props);

    return () => {
      return (
        <Slots.root>
          <Button {...buttonProps}>
            <Slots.chevronIcon />
          </Button>
          {showContextualMenu && renderContextualMenu(contextualMenuProps, menuItems)}
        </Slots.root>
      );
    };
  },
});
