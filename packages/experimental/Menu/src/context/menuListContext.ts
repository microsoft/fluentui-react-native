import * as React from 'react';
import type { MenuListState } from '../MenuList/MenuList.types';

/**
 * Context shared between Menu and its child components
 */
export type MenuListContextValue = Omit<MenuListState, 'props'> & {
  hasCheckmarks: boolean;
};

export const MenuListContext = React.createContext<MenuListContextValue>({
  isCheckedControlled: false,
  checked: {},
  hasCheckmarks: false,
  onCheckedChange: () => false,
  onArrowClose: () => false,
  addRadioItem: () => false,
  removeRadioItem: () => false,
});

export const MenuListProvider = MenuListContext.Provider;
export const useMenuListContext = () => React.useContext(MenuListContext);
