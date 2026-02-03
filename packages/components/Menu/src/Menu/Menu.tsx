import React from 'react';

import { phasedComponent, directComponent } from '@fluentui-react-native/framework-base';

import type { MenuProps } from './Menu.types';
import { menuName } from './Menu.types';
import { renderFinalMenu } from './renderMenu';
import { useMenu } from './useMenu';
import { useMenuContextValue } from './useMenuContextValue';

export const Menu = phasedComponent((props: MenuProps) => {
  const state = useMenu(props);
  const contextValue = useMenuContextValue(state);

  return directComponent<MenuProps>((rest: MenuProps) => {
    const childrenArray = React.Children.toArray(rest.children) as React.ReactElement[];

    if (__DEV__) {
      if (childrenArray.length !== 2) {
        console.warn('Menu must contain two children');
      }
    }
    return renderFinalMenu(childrenArray, contextValue, state);
  });
});

Menu.displayName = menuName;

export default Menu;
