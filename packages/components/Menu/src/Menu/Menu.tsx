import React from 'react';
import { menuName, MenuProps } from './Menu.types';
import { stagedComponent } from '@fluentui-react-native/framework';
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
        {state.open && menuPopover}
      </MenuProvider>
    );
  };
});
Menu.displayName = menuName;

export default Menu;
