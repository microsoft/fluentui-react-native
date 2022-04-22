import * as React from 'react';
import type { MenuState } from '../Menu/Menu.types';

/**
 * Context shared between Menu and its child components
 */
export type MenuContextValue = MenuState & {
  open: boolean;
};

export const MenuContext = React.createContext<MenuContextValue>({
  open: false,
});

export const MenuProvider = MenuContext.Provider;
export const useMenuContext = () => React.useContext(MenuContext);
