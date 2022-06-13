import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import React from 'react';
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
  const isOpenControlled = typeof props.open !== 'undefined';
  const [open, setOpen] = useMenuOpenState(isOpenControlled, props, context.setOpen);

  const [checked, onCheckedChange] = useMenuCheckedState(props);

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
    checked,
    onCheckedChange,
    triggerRef,
    isSubmenu,
    isControlled: isOpenControlled,
    parentPopoverHoverOutTimer,
  };
};

const useMenuOpenState = (
  isControlled: boolean,
  props: MenuProps,
  parentSetOpen: (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => void,
): [boolean, (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => void] => {
  const { defaultOpen, onOpenChange, open } = props;
  const initialState = typeof defaultOpen !== 'undefined' ? defaultOpen : !!open;
  const [openInternal, setOpenInternal] = React.useState<boolean>(initialState);

  const state = isControlled ? open : openInternal;

  const setOpen = React.useCallback(
    (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => {
      const openPrev = state;
      if (!isControlled) {
        if (!isOpen || lastCloseTimestamp + delayOpen <= Date.now()) {
          setOpenInternal(isOpen);
        }

        if (!isOpen) {
          lastCloseTimestamp = Date.now();
        }
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

  return [state, setOpen];
};

const useMenuCheckedState = (props: MenuProps): [string[], (e: InteractionEvent, checked: string[]) => void] => {
  const { checked, defaultChecked, onCheckedChange: onCheckedChangeOriginal } = props;
  const [checkedInternal, setCheckedInternal] = React.useState(defaultChecked ?? checked ?? []);

  const isControlled = typeof checked !== 'undefined';
  const state = isControlled ? checked : checkedInternal;

  const onCheckedChange = React.useCallback(
    (e: InteractionEvent, checked: string[]) => {
      if (!isControlled) {
        setCheckedInternal(checked);
      }

      onCheckedChangeOriginal?.(e, checked);
    },
    [isControlled, setCheckedInternal, onCheckedChangeOriginal],
  );

  return [state, onCheckedChange];
};
