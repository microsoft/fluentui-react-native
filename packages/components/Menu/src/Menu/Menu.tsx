import React from 'react';

import { stagedComponent } from '@fluentui-react-native/framework';

import type { MenuProps } from './Menu.types';
import { menuName } from './Menu.types';
import { useMenu } from './useMenu';
import { useMenuContextValue } from './useMenuContextValue';
import { MenuProvider } from '../context/menuContext';

export const Menu = stagedComponent((props: MenuProps) => {
  const state = useMenu(props);
  const contextValue = useMenuContextValue(state);

  return (_rest: MenuProps, children: React.ReactNode) => {
    const childrenArray = React.Children.toArray(children) as React.ReactElement[];

    if (__DEV__) {
      if (childrenArray.length !== 2) {
        // eslint-disable-next-line no-console
        console.warn('Menu must contain two children');
      }
    }

    const menuTrigger = childrenArray[0];
    const menuPopover = childrenArray[1];

    return (
      <MenuProvider value={contextValue}>
        {menuTrigger}
        {/* GH#2661: Make sure that shouldFocusOnContainer is defined before initializing
            the popover so that focus is put in the correct place */}
        {state.open && state.shouldFocusOnContainer !== undefined && menuPopover}
      </MenuProvider>
    );
  };
});
Menu.displayName = menuName;

export default Menu;
