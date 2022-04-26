import type { IViewProps } from '@fluentui-react-native/adapters';
import React from 'react';

export const menuName = 'Menu';

export interface MenuProps extends Omit<IViewProps, 'onPress'> {
  open?: boolean;
}

export interface MenuState extends MenuProps {
  isSubmenu: boolean;
  setOpen: (isOpen: boolean) => void;
  triggerRef: React.RefObject<React.Component>;
}
