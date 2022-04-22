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
    const childrenArray = React.Children.toArray(props.children) as React.ReactElement[];

    if (__DEV__) {
      if (childrenArray.length === 0) {
        // eslint-disable-next-line no-console
        console.warn('Menu must contain at least one child');
      }

      if (childrenArray.length > 2) {
        // eslint-disable-next-line no-console
        console.warn('Menu must contain at most two children');
      }
    }

    return <MenuProvider value={contextValue}>{children}</MenuProvider>;
  };
});
Menu.displayName = menuName;

export default Menu;
