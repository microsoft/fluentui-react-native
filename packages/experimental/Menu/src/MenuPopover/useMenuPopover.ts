import React from 'react';
import { I18nManager, Platform } from 'react-native';
import { DirectionalHint, DismissBehaviors } from '@fluentui-react-native/callout';
import { useMenuContext } from '../context/menuContext';
import { MenuPopoverProps, MenuPopoverState } from './MenuPopover.types';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { isCloseOnHoverOutEnabled } from '../consts';

export const useMenuPopover = (_props: MenuPopoverProps): MenuPopoverState => {
  const context = useMenuContext();
  const {
    setOpen,
    triggerRef,
    isControlled,
    isSubmenu,
    openOnHover,
    parentPopoverHoverOutTimer,
    popoverHoverOutTimer,
    setPopoverHoverOutTimer,
    triggerHoverOutTimer,
  } = context;

  const onDismiss = React.useCallback(() => setOpen(undefined, false /* isOpen */), [setOpen]);
  const dismissBehaviors = isControlled ? (['preventDismissOnKeyDown', 'preventDismissOnClickOutside'] as DismissBehaviors[]) : undefined;
  const directionalHint = getDirectionalHint(isSubmenu, I18nManager.isRTL);

  // Initial focus behavior differs per platform, Windows platforms move focus
  // automatically onto first element of Callout
  const setInitialFocus = Platform.OS === ('win32' as any) || Platform.OS === 'windows';
  const doNotTakePointerCapture = openOnHover;
  const accessibilityRole = 'menu';

  const onMouseEnter = React.useCallback(() => {
    clearTimeout(triggerHoverOutTimer);
    clearTimeout(popoverHoverOutTimer);
    clearTimeout(parentPopoverHoverOutTimer);
  }, [parentPopoverHoverOutTimer, popoverHoverOutTimer, triggerHoverOutTimer]);
  const onMouseLeave = React.useCallback(
    (e: InteractionEvent) => {
      if (!openOnHover) {
        return;
      }

      const timer = setTimeout(() => {
        setOpen(e, false /* isOpen */);
      }, 500);
      console.log('popoverout');
      setPopoverHoverOutTimer(timer);
    },
    [openOnHover, setOpen, setPopoverHoverOutTimer],
  );

  return {
    accessibilityRole,
    triggerRef,
    onDismiss,
    onMouseEnter,
    onMouseLeave: isCloseOnHoverOutEnabled && onMouseLeave,
    directionalHint,
    dismissBehaviors,
    doNotTakePointerCapture,
    setInitialFocus,
  };
};

const getDirectionalHint = (isSubmenu: boolean, isRtl: boolean): DirectionalHint | undefined => {
  if (!isSubmenu) {
    return undefined;
  }

  if (isRtl) {
    return 'leftTopEdge';
  }

  return 'rightTopEdge';
};
