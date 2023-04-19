import React from 'react';
import { I18nManager, Platform } from 'react-native';

import type { DirectionalHint, DismissBehaviors } from '@fluentui-react-native/callout';

import type { MenuPopoverProps, MenuPopoverState } from './MenuPopover.types';
import { useMenuContext } from '../context/menuContext';

const controlledDismissBehaviors = ['preventDismissOnKeyDown', 'preventDismissOnClickOutside'] as DismissBehaviors[];
const stopPropagationKeys = ['ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End', 'Escape'] as const;

export const useMenuPopover = (props: MenuPopoverProps): MenuPopoverState => {
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

  const { onKeyDown: onKeyDownProp, onKeyUp: onKeyUpProp } = props;

  const onDismiss = React.useCallback(() => {
    props.onDismiss?.();
    setOpen(undefined, false /* isOpen */), [setOpen];
  }, [props.onDismiss, setOpen]);
  const dismissBehaviors = isControlled ? controlledDismissBehaviors : undefined;
  const directionalHint = getDirectionalHint(isSubmenu, I18nManager.isRTL);

  // Initial focus behavior differs per platform, Windows platforms move focus
  // automatically onto first element of Callout
  const setInitialFocus = Platform.OS === ('win32' as any) || Platform.OS === 'windows';
  const doNotTakePointerCapture = props.doNotTakePointerCapture ?? context.parentDoNotTakePointerCapture;
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

  const onKeyDown = React.useCallback(
    (e) => {
      onKeyDownProp && onKeyDownProp(e);

      // Mark key events that move selection as handled.
      // These key events are handled on the native side.
      if (stopPropagationKeys.includes(e.nativeEvent.key)) {
        e.stopPropagation();
      }
    },
    [onKeyDownProp],
  );

  const onKeyUp = React.useCallback(
    (e) => {
      onKeyUpProp && onKeyUpProp(e);

      // Mark key events that move selection as handled.
      // These key events are handled on the native side.
      if (stopPropagationKeys.includes(e.nativeEvent.key)) {
        e.stopPropagation();
      }
    },
    [onKeyUpProp],
  );

  const [canFocusOnPopover, setCanFocusOnPopover] = React.useState<boolean>(shouldFocusOnContainer);
  const onBlur = React.useCallback(() => {
    setCanFocusOnPopover(false);
  }, [setCanFocusOnPopover]);

  // On win32, prevent the submenu from closing prematurely
  // when the parent menu takes pointer capture and we still
  // have mouse hover on the submenu trigger
  const onFocus = React.useCallback(() => {
    if (Platform.OS === ('win32' as any) && isSubmenu && !doNotTakePointerCapture) {
      clearTimeout(triggerHoverOutTimer);
      clearTimeout(popoverHoverOutTimer);
      clearTimeout(parentPopoverHoverOutTimer);
    }
  }, [isSubmenu, doNotTakePointerCapture, parentPopoverHoverOutTimer, popoverHoverOutTimer, triggerHoverOutTimer]);

  React.useEffect(() => {
    return function cleanup() {
      clearTimeout(popoverHoverOutTimer);
    };
  });

  return {
    props: {
      accessibilityRole,
      target: triggerRef,
      onDismiss,
      onShow: props.onShow,
      directionalHint,
      dismissBehaviors,
      doNotTakePointerCapture,
      setInitialFocus,
    },
    innerView: {
      onMouseEnter,
      onMouseLeave,
      onKeyDown,
      onKeyUp,
      accessible: shouldFocusOnContainer,
      focusable: canFocusOnPopover,
      onBlur,
      onFocus,
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
