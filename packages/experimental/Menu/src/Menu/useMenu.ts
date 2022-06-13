import { InteractionEvent, isMouseEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
import { Platform } from 'react-native';
import { useMenuContext } from '../context/menuContext';
import { MenuProps, MenuState } from './Menu.types';

// Due to how events get fired we get double notifications
// for the same event causing us to immediately reopen
// a menu when we close it. Adding in a delay to prevent
// this behavior.
const delayOpen = 150;
let lastCloseTimestamp = -1;

export const useMenu = (props: MenuProps): MenuState => {
  const triggerRef = React.useRef();
  const context = useMenuContext();
  const isSubmenu = context.triggerRef !== null;
  const isControlled = typeof props.open !== 'undefined';
  const [open, shouldFocusOnContainer, setOpen] = useMenuOpenState(isControlled, props, context.setOpen);

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

const useMenuOpenState = (
  isControlled: boolean,
  props: MenuProps,
  parentSetOpen: (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => void,
): [boolean, boolean, (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => void] => {
  const { defaultOpen, onOpenChange, open } = props;
  const initialState = typeof defaultOpen !== 'undefined' ? defaultOpen : !!open;
  const [openInternal, setOpenInternal] = React.useState<boolean>(initialState);
  const [shouldFocusOnContainer, setShouldFocusOnContainer] = React.useState<boolean>(false);

  const state = isControlled ? open : openInternal;

  const setOpen = React.useCallback(
    (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => {
      const openPrev = state;
      if (!isControlled && (!isOpen || lastCloseTimestamp + delayOpen <= Date.now())) {
        setOpenInternal(isOpen);
      }

      if (isOpen && Platform.OS === ('win32' as any) && isMouseEvent(e)) {
        setShouldFocusOnContainer(true);
      }

      if (!isOpen) {
        setShouldFocusOnContainer(false);
        lastCloseTimestamp = Date.now();
      }

      if (onOpenChange && openPrev !== isOpen) {
        onOpenChange(e, isOpen);
      }

      if (bubble && parentSetOpen) {
        parentSetOpen(e, isOpen, bubble);
      }
    },
    [isControlled, state, onOpenChange, setOpenInternal, parentSetOpen],
  );

  return [state, shouldFocusOnContainer, setOpen];
};
