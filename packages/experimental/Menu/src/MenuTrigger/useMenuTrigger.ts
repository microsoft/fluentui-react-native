import { useMenuContext } from '../context/menuContext';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerProps, MenuTriggerState } from './MenuTrigger.types';
import { AccessibilityActionEvent, AccessibilityActionName, Platform } from 'react-native';
import React from 'react';

const accessibilityActions =
  Platform.OS === ('win32' as any) ? [{ name: 'Expand' as AccessibilityActionName }, { name: 'Collapse' as AccessibilityActionName }] : [];

export const useMenuTrigger = (_props: MenuTriggerProps): MenuTriggerState => {
  const context = useMenuContext();

  const setOpen = context.setOpen;
  const open = context.open;
  const openOnHover = context.openOnHover;
  const triggerRef = context.triggerRef;
  const accessibilityState = context.open ? { expanded: true } : { expanded: false };
  const setTriggerHoverOutTimer = context.setTriggerHoverOutTimer;

  const onAccessibilityAction = React.useCallback(
    (e: AccessibilityActionEvent) => {
      if (Platform.OS === ('win32' as any)) {
        switch (e.nativeEvent.actionName) {
          case 'Expand':
            setOpen(e, true /* isOpen */);
            break;

          case 'Collapse':
            setOpen(e, false /* isOpen */);
            break;
        }
      }
    },
    [setOpen],
  );

  const delayHover = Platform.select({
    macos: 100,
    default: 500, // win32
  });

  const onHoverIn = React.useCallback(
    (e: InteractionEvent) => {
      if (openOnHover) {
        setTimeout(() => {
          setOpen(e, true /* isOpen */);
        }, delayHover);
      }
    },
    [openOnHover, setOpen, delayHover],
  );

  const onHoverOut = React.useCallback(
    (e: InteractionEvent) => {
      if (openOnHover) {
        const timer = setTimeout(() => {
          setOpen(e, false /* isOpen */);
        }, delayHover);
        setTriggerHoverOutTimer(timer);
      }
    },
    [openOnHover, setOpen, delayHover, setTriggerHoverOutTimer],
  );

  const onClick = React.useCallback(
    (e: InteractionEvent) => {
      setOpen(e, !open);
    },
    [open, setOpen],
  );

  return {
    props: {
      onClick,
      onHoverIn,
      onHoverOut: Platform.OS === ('win32' as any) && onHoverOut,
      componentRef: triggerRef,
      accessibilityState,
      accessibilityActions,
      onAccessibilityAction,
    },
    hasSubmenu: context.isSubmenu,
  };
};
