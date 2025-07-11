import React from 'react';
import { I18nManager } from 'react-native';

import type { DirectionalHint, DismissBehaviors } from '@fluentui-react-native/callout';

import type { MenuPopoverProps, MenuPopoverState } from './MenuPopover.types';
import { useMenuContext } from '../context/menuContext';

const controlledDismissBehaviors = ['preventDismissOnKeyDown', 'preventDismissOnClickOutside'] as DismissBehaviors[];
const stopPropagationKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Escape'] as const;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.onDismiss, setOpen]);
  const dismissBehaviors = isControlled ? controlledDismissBehaviors : undefined;
  const directionalHint = props.directionalHint ?? getDirectionalHint(isSubmenu, I18nManager.isRTL);

  const setInitialFocus = true;
  const doNotTakePointerCapture = props.doNotTakePointerCapture ?? openOnHover;
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
