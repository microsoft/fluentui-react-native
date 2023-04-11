import React from 'react';
import { View } from 'react-native';

import type { MenuState } from './Menu.types';
import type { MenuContextValue } from '../context';
import { MenuProvider } from '../context';

export const renderFinalMenu = (childrenArray: React.ReactElement[], contextValue: MenuContextValue, state: MenuState) => {
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
