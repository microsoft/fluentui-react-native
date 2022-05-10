import { DismissBehaviors } from '@fluentui-react-native/callout';
import { useMenuContext } from '../context/menuContext';
import { MenuPopoverProps, MenuPopoverState } from './MenuPopover.types';

export const useMenuPopover = (_props: MenuPopoverProps): MenuPopoverState => {
  const context = useMenuContext();

  const triggerRef = context.triggerRef;
  const onDismiss = context.setOpen(undefined, false /* isOpen */);
  const dismissBehaviors = context.isControlled
    ? (['preventDismissOnKeyDown', 'preventDismissOnClickOutside'] as DismissBehaviors[])
    : undefined;

  return { triggerRef, onDismiss, dismissBehaviors };
};
