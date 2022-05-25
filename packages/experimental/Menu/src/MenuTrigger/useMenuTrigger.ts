import { useMenuContext } from '../context/menuContext';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerProps } from './MenuTrigger.types';
import { AccessibilityActionEvent, Platform } from 'react-native';
import React from 'react';

export const useMenuTrigger = (_props: MenuTriggerProps) => {
  const context = useMenuContext();

  const setOpen = context.setOpen;
  const open = context.open;
  const openOnHover = context.openOnHover;
  const triggerRef = context.triggerRef;
  const accessibilityState = context.open ? ['expanded'] : [];
  const onAccessibilityAction = React.useCallback(
    (e: AccessibilityActionEvent) => {
      switch (e.nativeEvent.actionName) {
        case 'Expand':
          setOpen(e, true /* isOpen */);
          break;

        case 'Collapse':
          setOpen(e, true /* isOpen */);
          break;
      }
    },
    [setOpen],
  );

  const delayHover = Platform.select({
    macos: 100,
    default: 500, // win32
  });

  const onHoverIn = (e: InteractionEvent) => {
    if (openOnHover) {
      setOpen(e, true /* isOpen */);
    }
  };

  const onHoverOut = (e: InteractionEvent) => {
    if (openOnHover) {
      setOpen(e, false /* isOpen */);
    }
  };

  const onClick = (e: InteractionEvent) => {
    setOpen(e, !open);
  };

  return {
    onClick,
    onHoverIn,
    onHoverOut,
    componentRef: triggerRef,
    delayHoverIn: delayHover,
    delayHoverOut: delayHover,
    accessibilityState,
    onAccessibilityAction,
  };
};
