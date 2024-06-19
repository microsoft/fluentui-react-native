import * as React from 'react';

import type { MenuListState } from '../MenuList/MenuList.types';

/**
 * Context shared between Menu and its child components
 */
export type MenuListContextValue = Omit<MenuListState, 'props' | 'focusZoneRef' | 'hasMaxHeight' | 'hasMaxWidth'> & {
  hasCheckmarks: boolean;
  hasIcons: boolean;
  hasTooltips: boolean;
};

export const MenuListContext = React.createContext<MenuListContextValue>({
  isCheckedControlled: false,
  checked: {},
  hasCheckmarks: false,
  hasIcons: false,
  hasTooltips: false,
  onCheckedChange: () => false,
  onArrowClose: () => false,
  addRadioItem: () => false,
  removeRadioItem: () => false,
  trackMenuItem: () => false,
  untrackMenuItem: () => false,
});

export const MenuListProvider = MenuListContext.Provider;
export const useMenuListContext = () => React.useContext(MenuListContext);
