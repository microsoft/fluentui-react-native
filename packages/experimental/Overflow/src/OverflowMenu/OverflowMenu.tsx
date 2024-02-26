/** @jsxRuntime classic */
import * as React from 'react';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { stagedComponent, mergeProps } from '@fluentui-react-native/framework';
import { Menu, MenuItem, MenuTrigger, MenuPopover } from '@fluentui-react-native/menu';

import { overflowMenuName } from './OverflowMenu.types';
import type { OverflowMenuProps } from './OverflowMenu.types';
import { useOverflowMenu } from './useOverflowMenu';

export const OverflowMenu = stagedComponent((initial: OverflowMenuProps) => {
  const state = useOverflowMenu();
  return (final: OverflowMenuProps) => {
    const { buttonProps, ...mergedProps } = mergeProps(initial, final);
    if (!state.showMenu) {
      return null;
    }
    return (
      <Menu {...mergedProps}>
        <MenuTrigger>
          <Button {...buttonProps} />
        </MenuTrigger>
        <MenuPopover>
          {state.menuItems.map((id) => (
            <MenuItem key={id}>{mergedProps.getMenuItemLabel ? mergedProps.getMenuItemLabel(id) : `Item ${id}`}</MenuItem>
          ))}
        </MenuPopover>
      </Menu>
    );
  };
});

OverflowMenu.displayName = overflowMenuName;
