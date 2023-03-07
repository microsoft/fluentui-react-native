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
  hasIcons: false,
  hasTooltips: false,
  isSubmenu: false,
  open: false,
  onCheckedChange: () => false,
  setOpen: () => false,
  shouldFocusOnContainer: undefined,
  triggerRef: null,
  hasMaxHeight: false,
  hasMaxWidth: false,
});

export const MenuProvider = MenuContext.Provider;
export const useMenuContext = () => React.useContext(MenuContext);
