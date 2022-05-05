import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
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

const useMenuOpenState = (props: MenuProps): [boolean, (e: InteractionEvent) => void] => {
  const { defaultOpen, onOpenChange, open } = props;
  const initialState = typeof defaultOpen !== 'undefined' ? defaultOpen : !!open;
  const [openInternal, setOpenInternal] = React.useState<boolean>(initialState);

  const setOpen = React.useCallback(
    (e: InteractionEvent) => {
      setOpenInternal(!openInternal);
      onOpenChange(e, !openInternal);
    },
    [openInternal, onOpenChange, setOpenInternal],
  );

  return [openInternal, setOpen];
};
