import React from 'react';
import { I18nManager, Platform } from 'react-native';
import { DirectionalHint, DismissBehaviors } from '@fluentui-react-native/callout';
import { useMenuContext } from '../context/menuContext';
import { MenuPopoverProps, MenuPopoverState } from './MenuPopover.types';
import { isCloseOnHoverOutEnabled } from '../consts';

const controlledDismissBehaviors = ['preventDismissOnKeyDown', 'preventDismissOnClickOutside'] as DismissBehaviors[];

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
    shouldFocusOnContainer,
    triggerHoverOutTimer,
  } = context;

  const onDismiss = React.useCallback(() => setOpen(undefined, false /* isOpen */), [setOpen]);
  const dismissBehaviors = isControlled ? controlledDismissBehaviors : undefined;
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
  const onMouseLeave = React.useCallback(() => {
    if (!openOnHover) {
      return;
    }

    const timer = setTimeout(() => {
      setOpen(undefined, false /* isOpen */);
    }, 500);
    setPopoverHoverOutTimer(timer);
  }, [openOnHover, setOpen, setPopoverHoverOutTimer]);

  const [canFocusOnPopover, setCanFocusOnPopover] = React.useState<boolean>(shouldFocusOnContainer);
  const onBlur = React.useCallback(() => {
    setCanFocusOnPopover(false);
  }, [setCanFocusOnPopover]);

  return {
    props: {
      accessibilityRole,
      target: triggerRef,
      onDismiss,
      directionalHint,
      dismissBehaviors,
      doNotTakePointerCapture,
      setInitialFocus,
    },
    innerView: {
      onMouseEnter,
      onMouseLeave: isCloseOnHoverOutEnabled && onMouseLeave,
      accessible: shouldFocusOnContainer,
      focusable: canFocusOnPopover,
      onBlur,
    },
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
