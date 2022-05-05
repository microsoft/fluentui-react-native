import { useMenuContext } from '../context/menuContext';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerProps } from './MenuTrigger.types';

export const useMenuTrigger = (_props: MenuTriggerProps) => {
  const context = useMenuContext();

  const setOpen = context.setOpen;
  const openOnHover = context.openOnHover;
  const triggerRef = context.triggerRef;

  const onHoverIn = (e: InteractionEvent) => {
    if (openOnHover) {
      setOpen(e);
    }
  };

  const onHoverOut = (e: InteractionEvent) => {
    if (openOnHover) {
      setOpen(e);
    }
  };

  const onClick = (e: InteractionEvent) => {
    setOpen(e);
  };

  return { onClick, onHoverIn, onHoverOut, componentRef: triggerRef };
};
