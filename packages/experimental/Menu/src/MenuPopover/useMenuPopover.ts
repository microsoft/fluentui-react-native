import React from 'react';
import { Platform } from 'react-native';
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

  // Initial focus behavior differs per platform, Windows platforms move focus
  // automatically onto first element of Callout
  const setInitialFocus = Platform.OS === ('win32' as any) || Platform.OS === 'windows';
  const doNotTakePointerCapture = context.openOnHover;
  const accessibilityRole = 'menu';

  return { accessibilityRole, triggerRef, onDismiss, dismissBehaviors, doNotTakePointerCapture, setInitialFocus };
};
