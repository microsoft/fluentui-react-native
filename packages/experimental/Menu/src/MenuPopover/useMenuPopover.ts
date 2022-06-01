import React from 'react';
import { I18nManager, Platform } from 'react-native';
import { DirectionalHint, DismissBehaviors } from '@fluentui-react-native/callout';
import { useMenuContext } from '../context/menuContext';
import { MenuPopoverProps, MenuPopoverState } from './MenuPopover.types';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

export const useMenuPopover = (_props: MenuPopoverProps): MenuPopoverState => {
  const context = useMenuContext();
  const { setOpen, triggerRef, isControlled, isSubmenu, openOnHover, triggerHoverOutTimer } = context;

  const onDismiss = React.useCallback(() => setOpen(undefined, false /* isOpen */), [setOpen]);
  const dismissBehaviors = isControlled ? (['preventDismissOnKeyDown', 'preventDismissOnClickOutside'] as DismissBehaviors[]) : undefined;
  const directionalHint = getDirectionalHint(isSubmenu, I18nManager.isRTL);

  // Initial focus behavior differs per platform, Windows platforms move focus
  // automatically onto first element of Callout
  const setInitialFocus = Platform.OS === ('win32' as any) || Platform.OS === 'windows';
  const doNotTakePointerCapture = openOnHover;
  const accessibilityRole = 'menu';

  const [timer, setTimer] = React.useState<NodeJS.Timeout>();
  const onMouseEnter = React.useCallback(() => {
    clearTimeout(triggerHoverOutTimer);
    clearTimeout(timer);
  }, [timer, triggerHoverOutTimer]);
  const onMouseLeave = React.useCallback(
    (e: InteractionEvent) => {
      setTimer(
        setTimeout(() => {
          setOpen(e, false /* isOpen */);
        }, 500),
      );
    },
    [setOpen, setTimer],
  );

  return {
    accessibilityRole,
    triggerRef,
    onDismiss,
    onMouseEnter,
    onMouseLeave: Platform.OS === ('win32' as any) && onMouseLeave,
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
