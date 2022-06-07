import * as React from 'react';
import type { MenuListState } from '../MenuList/MenuList.types';

/**
 * Context shared between Menu and its child components
 */
export type MenuListContextValue = MenuListState;

export const MenuListContext = React.createContext<MenuListContextValue>({
  isCheckedControlled: false,
  checked: {},
  defaultChecked: {},
  hasCheckmarks: false,
  onCheckedChange: () => false,
  addRadioItem: () => false,
  removeRadioItem: () => false,
});

export const MenuListProvider = MenuListContext.Provider;
export const useMenuListContext = () => React.useContext(MenuListContext);
