import React from 'react';
import { I18nManager, Platform } from 'react-native';
import { DirectionalHint, DismissBehaviors } from '@fluentui-react-native/callout';
import { useMenuContext } from '../context/menuContext';
import { MenuPopoverProps, MenuPopoverState } from './MenuPopover.types';

const controlledDismissBehaviors = ['preventDismissOnKeyDown', 'preventDismissOnClickOutside'] as DismissBehaviors[];

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
    props.onDismiss();
    setOpen(undefined, false /* isOpen */), [setOpen];
  }, [props.onDismiss, setOpen]);
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

  const onKeyDown = React.useCallback(
    (e) => {
      onKeyDownProp && onKeyDownProp(e);

      // Mark key events that move selection as handled.
      // These key events are handled on the native side.
      switch (e.nativeEvent.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'Tab':
        case 'Home':
        case 'End':
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
      switch (e.nativeEvent.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'Tab':
        case 'Home':
        case 'End':
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
