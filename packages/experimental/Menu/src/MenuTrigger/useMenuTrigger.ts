import { useMenuContext } from '../context/menuContext';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerProps, MenuTriggerState } from './MenuTrigger.types';
import { Platform } from 'react-native';

export const useMenuTrigger = (_props: MenuTriggerProps): MenuTriggerState => {
  const context = useMenuContext();

  const setOpen = context.setOpen;
  const open = context.open;
  const openOnHover = context.openOnHover;
  const triggerRef = context.triggerRef;

  const delayHover = Platform.select({
    macos: 100,
    default: 500, // win32
  });

  const onHoverIn = (e: InteractionEvent) => {
    if (openOnHover) {
      setOpen(e, true /* isOpen */);
    }
  };

  const onHoverOut = (e: InteractionEvent) => {
    if (openOnHover) {
      setOpen(e, false /* isOpen */);
    }
  };

  const onClick = (e: InteractionEvent) => {
    setOpen(e, !open);
  };

  return {
    props: { onClick, onHoverIn, onHoverOut, componentRef: triggerRef, delayHoverIn: delayHover, delayHoverOut: delayHover },
    hasSubmenu: context.isSubmenu,
  };
};
