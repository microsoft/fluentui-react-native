import { InteractionEvent, isMouseEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
import { Platform } from 'react-native';
import { useMenuContext } from '../context/menuContext';
import { MenuProps, MenuState } from './Menu.types';

export const useMenu = (props: MenuProps): MenuState => {
  const triggerRef = React.useRef();
  const context = useMenuContext();
  const isSubmenu = context.triggerRef !== null;
  const isControlled = typeof props.open !== 'undefined';
  const [open, shouldFocusOnContainer, setOpen] = useMenuOpenState(isControlled, props);

  // Default behavior for submenu is to open on hover
  // the ...props line below will override this behavior for a submenu
  // or apply openOnHover if passed into a root Menu.
  const openOnHover = isSubmenu;

  // We need to be able to cancel the timer that gets set on
  // hover out of the parent popover if the parent popover
  // is also set to open/close on hover out. Otherwise
  // the parent menu will close when the timeout passes.
  const parentPopoverHoverOutTimer = isSubmenu ? context.popoverHoverOutTimer : undefined;

  return {
    openOnHover,
    ...props,
    open,
    setOpen,
    shouldFocusOnContainer,
    triggerRef,
    isSubmenu,
    isControlled,
    parentPopoverHoverOutTimer,
  };
};

const useMenuOpenState = (isControlled: boolean, props: MenuProps): [boolean, boolean, (e: InteractionEvent, isOpen: boolean) => void] => {
  const { defaultOpen, onOpenChange, open } = props;
  const initialState = typeof defaultOpen !== 'undefined' ? defaultOpen : !!open;
  const [openInternal, setOpenInternal] = React.useState<boolean>(initialState);
  const [shouldFocusOnContainer, setShouldFocusOnContainer] = React.useState<boolean>(false);

  const state = isControlled ? open : openInternal;

  const setOpen = React.useCallback(
    (e: InteractionEvent, isOpen: boolean) => {
      const openPrev = state;
      if (!isControlled) {
        if (isOpen && Platform.OS === ('win32' as any)) {
          if (isMouseEvent(e)) {
            setShouldFocusOnContainer(true);
          }
        }
        if (!isOpen) {
          setShouldFocusOnContainer(false);
        }
        setOpenInternal(isOpen);
      }

      if (onOpenChange && openPrev !== isOpen) {
        onOpenChange(e, isOpen);
      }
    },
    [isControlled, state, onOpenChange, setOpenInternal],
  );

  return [state, shouldFocusOnContainer, setOpen];
};
