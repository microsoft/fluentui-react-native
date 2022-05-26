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
  const onAccessibilityAction = React.useCallback(
    (e: AccessibilityActionEvent) => {
      if (Platform.OS === ('win32' as any)) {
        switch (e.nativeEvent.actionName) {
          case 'Expand':
            setOpen(e, true /* isOpen */);
            break;

          case 'Collapse':
            setOpen(e, true /* isOpen */);
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
    onHoverOut: Platform.OS === ('win32' as any) && onHoverOut,
    componentRef: triggerRef,
    delayHoverIn: delayHover,
    delayHoverOut: Platform.OS === ('win32' as any) && delayHover,
    accessibilityState,
    accessibilityActions,
    onAccessibilityAction,
  };
};
