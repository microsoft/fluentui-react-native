import type { MenuListProps } from '../MenuList/MenuList.types';
import React from 'react';

export const menuName = 'Menu';

export interface MenuProps extends MenuListProps {
  open?: boolean;
}

export interface MenuState extends MenuProps {
  isSubmenu: boolean;
  setOpen: (isOpen: boolean) => void;
  triggerRef: React.RefObject<React.Component>;
}
