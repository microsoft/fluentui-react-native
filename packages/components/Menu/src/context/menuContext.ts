import * as React from 'react';
import type { MenuState } from '../Menu/Menu.types';

/**
 * Context shared between Menu and its child components
 */
export interface MenuContextValue extends MenuState {
  popoverHoverOutTimer?: NodeJS.Timeout;
  triggerHoverOutTimer?: NodeJS.Timeout;
  setPopoverHoverOutTimer?: (timer: NodeJS.Timeout) => void;
  setTriggerHoverOutTimer?: (timer: NodeJS.Timeout) => void;
}

export const MenuContext = React.createContext<MenuContextValue>({
  isControlled: false,
  checked: [],
  defaultChecked: [],
  hasCheckmarks: false,
  isSubmenu: false,
  open: false,
  onCheckedChange: () => false,
  setOpen: () => false,
  shouldFocusOnContainer: false,
  triggerRef: null,
});

export const MenuProvider = MenuContext.Provider;
export const useMenuContext = () => React.useContext(MenuContext);
