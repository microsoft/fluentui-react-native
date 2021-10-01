/** @jsx withSlots */
import React from 'react';
import { Button } from '@fluentui-react-native/experimental-button';
import { compose, UseSlots, withSlots, mergeProps } from '@fluentui-react-native/framework';
import { stylingSettings } from './MenuButton.styling';
import { renderContextualMenu } from './renderContextualMenu';
import { SvgXml } from 'react-native-svg';
import { useMenuButton } from './useMenuButton';

import { menuButtonName, MenuButtonProps, MenuButtonType } from './MenuButton.types';

const defaultIconColor = '#616161';
const primaryIconColor = '#ffffff';

export const MenuButton = compose<MenuButtonType>({
  displayName: menuButtonName,
  ...stylingSettings,
  slots: {
    root: React.Fragment,
    chevronIcon: SvgXml,
    button: Button,
  },
  render: (userProps: MenuButtonProps, useSlots: UseSlots<MenuButtonType>) => {
    const MenuButton = useMenuButton(userProps);

    const Slots = useSlots(MenuButton.props, layer => MenuButton.state[layer] || MenuButton.props[layer]);

    return (final: MenuButtonProps) => {
      const { primary, contextualMenu, menuItems, ...mergedProps } = mergeProps(MenuButton.props, final);
      const chevronColor = primary ? primaryIconColor : defaultIconColor;
      const chevronXml = `
          <svg width="12" height="16" viewBox="0 0 11 6" color=${chevronColor}>
            <path fill='currentColor' d='M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z' />
          </svg>`;

      return (
        <Slots.root>
          <Slots.button {...mergedProps} primary={primary}>
            <Slots.chevronIcon xml={chevronXml} />
          </Slots.button>
          {MenuButton.state.showContextualMenu && renderContextualMenu(contextualMenu, menuItems)}
        </Slots.root>
      );
    };
  },
});
