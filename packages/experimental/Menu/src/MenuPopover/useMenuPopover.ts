import React from 'react';
import { DismissBehaviors } from '@fluentui-react-native/callout';
import { useMenuContext } from '../context/menuContext';
import { MenuPopoverProps, MenuPopoverState } from './MenuPopover.types';

export const useMenuPopover = (_props: MenuPopoverProps): MenuPopoverState => {
  const context = useMenuContext();
  const setOpen = context.setOpen;

  const triggerRef = context.triggerRef;
  const onDismiss = React.useCallback(() => setOpen(undefined, false /* isOpen */), [setOpen]);
  const dismissBehaviors = context.isControlled
    ? (['preventDismissOnKeyDown', 'preventDismissOnClickOutside'] as DismissBehaviors[])
    : undefined;

  return { triggerRef, onDismiss, dismissBehaviors };
};
