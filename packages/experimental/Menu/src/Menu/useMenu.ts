import React from 'react';
import { MenuProps, MenuState } from './Menu.types';

export const useMenu = (props: MenuProps): MenuState => {
  const [open, setOpen] = useMenuOpenState(props);

  return {
    open,
    setOpen,
  };
};

const useMenuOpenState = (props: MenuProps) => {
  return React.useState<boolean>(props.open);
};
