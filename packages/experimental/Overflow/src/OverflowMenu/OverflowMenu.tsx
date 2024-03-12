import * as React from 'react';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { stagedComponent, mergeProps } from '@fluentui-react-native/framework';
import { Menu, MenuTrigger, MenuPopover, MenuItem } from '@fluentui-react-native/menu';
import type { MenuItemProps } from '@fluentui-react-native/menu';

import { overflowMenuName } from './OverflowMenu.types';
import type { OverflowMenuProps } from './OverflowMenu.types';
import { useOverflowMenu } from './useOverflowMenu';

function defaultMapMenuItemProps(id: string): MenuItemProps {
  return {
    children: `Item ${id}`,
  };
}

/**
 * Pre-made OverflowMenu component that's usable without too much customization.
 *
 * For more customization, you can either edit the props or create your own OverflowMenu using `useOverflowMenu`.
 */
export const OverflowMenu = stagedComponent<OverflowMenuProps>((userProps) => {
  const { showMenu, menuTriggerRef, onMenuTriggerLayout, visibleMenuItems } = useOverflowMenu();

  const itemCount = visibleMenuItems.length;
  const defaultProps: OverflowMenuProps = React.useMemo(
    () => ({
      triggerProps: {
        style: {
          alignSelf: 'center',
        },
        children: `+ ${itemCount} item${itemCount !== 1 ? 's' : ''}`,
        componentRef: menuTriggerRef,
        onLayout: onMenuTriggerLayout,
      },
      mapMenuItemProps: defaultMapMenuItemProps,
    }),
    [itemCount, menuTriggerRef, onMenuTriggerLayout],
  );

  return (final) => {
    const props = mergeProps(defaultProps, userProps, final);
    if (!showMenu) {
      return null;
    }

    return (
      <Menu {...props.menuProps}>
        <MenuTrigger>
          <Button {...props.triggerProps} />
        </MenuTrigger>
        <MenuPopover>
          {visibleMenuItems.map((item) => {
            if (props.mapMenuItemProps) {
              const menuItemProps = props.mapMenuItemProps(item);
              return <MenuItem {...menuItemProps} key={item} />;
            }
            return null;
          })}
        </MenuPopover>
      </Menu>
    );
  };
});
OverflowMenu.displayName = overflowMenuName;
