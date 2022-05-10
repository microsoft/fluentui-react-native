import { useMenuContext } from '../context/menuContext';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerProps } from './MenuTrigger.types';

export const useMenuTrigger = (_props: MenuTriggerProps) => {
  const context = useMenuContext();

  const setOpen = context.setOpen;
  const open = context.open;
  const triggerRef = context.triggerRef;

  const onClick = (_e: InteractionEvent) => {
    setOpen(!open);
  };

  return { onClick, componentRef: triggerRef };
};
