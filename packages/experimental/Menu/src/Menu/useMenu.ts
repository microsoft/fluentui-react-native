import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
import { useMenuContext } from '../context/menuContext';
import { MenuProps, MenuState } from './Menu.types';

export const useMenu = (props: MenuProps): MenuState => {
  const triggerRef = React.useRef(null);
  const context = useMenuContext();
  const isSubmenu = context.triggerRef !== null;
  const isControlled = typeof props.open !== 'undefined';
  const [open, setOpen] = useMenuOpenState(isControlled, props);
  const openOnHover = isSubmenu;

  return {
    openOnHover,
    ...props,
    open,
    setOpen,
    triggerRef,
    isSubmenu,
    isControlled,
  };
};

const useMenuOpenState = (isControlled: boolean, props: MenuProps): [boolean, (e: InteractionEvent, isOpen: boolean) => void] => {
  const { defaultOpen, onOpenChange, open } = props;
  const initialState = typeof defaultOpen !== 'undefined' ? defaultOpen : !!open;
  const [openInternal, setOpenInternal] = React.useState<boolean>(initialState);

  const state = isControlled ? open : openInternal;

  const setOpen = React.useCallback(
    (e: InteractionEvent, isOpen: boolean) => {
      const openPrev = state;
      if (!isControlled) {
        setOpenInternal(isOpen);
      }
      if (onOpenChange && openPrev !== isOpen) {
        onOpenChange(e, isOpen);
      }
    },
    [isControlled, state, onOpenChange, setOpenInternal],
  );

  return [state, setOpen];
};
