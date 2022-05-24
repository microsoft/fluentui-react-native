import { useMenuContext } from '../context/menuContext';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerProps, MenuTriggerState } from './MenuTrigger.types';

export const useMenuTrigger = (_props: MenuTriggerProps): MenuTriggerState => {
  const context = useMenuContext();

  const setOpen = context.setOpen;
  const open = context.open;
  const openOnHover = context.openOnHover;
  const triggerRef = context.triggerRef;

  const onHoverIn = (e: InteractionEvent) => {
    if (openOnHover) {
      setOpen(e, true /* isOpen */);
    }
  };

  const onClick = (e: InteractionEvent) => {
    setOpen(e, !open);
  };

  return { props: { onClick, onHoverIn, componentRef: triggerRef }, isSubmenu: context.isSubmenu };
};
