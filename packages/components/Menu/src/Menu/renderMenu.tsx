import React from 'react';

import type { MenuState } from './Menu.types';
import type { MenuContextValue } from '../context';
import { MenuProvider } from '../context';

export const renderFinalMenu = (childrenArray: React.ReactElement[], contextValue: MenuContextValue, state: MenuState) => {
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
