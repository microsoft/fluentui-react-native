/** @jsxRuntime classic */
import * as React from 'react';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { stagedComponent, mergeProps } from '@fluentui-react-native/framework';
import { Menu, MenuItem, MenuTrigger, MenuPopover } from '@fluentui-react-native/menu';

import { overflowMenuName } from './OverflowMenu.types';
import type { OverflowMenuProps } from './OverflowMenu.types';
import { useOverflowMenu } from './useOverflowMenu';

export const OverflowMenu = stagedComponent((initial: OverflowMenuProps) => {
  const { state, props } = useOverflowMenu(initial);
  return (final: OverflowMenuProps) => {
    const { buttonProps, ...rest } = mergeProps(props, final);
    if (!state.showMenu) {
      return null;
    }
    return (
      <Menu {...rest}>
        <MenuTrigger>
          <Button {...buttonProps} />
        </MenuTrigger>
        <MenuPopover>
          {state.menuItems.map((id) => (
            <MenuItem key={id}>{props.getMenuItemLabel ? props.getMenuItemLabel(id) : `Item ${id}`}</MenuItem>
          ))}
        </MenuPopover>
      </Menu>
    );
  };
});

OverflowMenu.displayName = overflowMenuName;
