import React from 'react';
import { View } from 'react-native';

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
        <View
          onLayout={(event) => {
            const { width } = event.nativeEvent.layout;
            state.setAnchorWidth(width);
          }}
        >
          {menuTrigger}
        </View>
        <View ref={state._container} collapsable={false} testID={state.testID}>
          {state.open && menuPopover}
        </View>
      </MenuProvider>
    );
  };
});

Menu.displayName = menuName;
export default Menu;
