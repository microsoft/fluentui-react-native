import React from 'react';
import { useMenuContext } from '../context/menuContext';
import { MenuProps, MenuState } from './Menu.types';

export const useMenu = (props: MenuProps): MenuState => {
  const [open, setOpen] = useMenuOpenState(props);
  const triggerRef = React.useRef(null);
  const context = useMenuContext();
  const isSubmenu = context.triggerRef !== null;

  return {
    ...props,
    open,
    setOpen,
    triggerRef,
    isSubmenu,
  };
};

const useMenuOpenState = (props: MenuProps) => {
  return React.useState<boolean>(props.open);
};
