import { useMenuContext } from '../context/menuContext';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { MenuTriggerChildProps, MenuTriggerState } from './MenuTrigger.types';
import { AccessibilityActionEvent, AccessibilityActionName, Platform } from 'react-native';
import React from 'react';
import { hoverDelayDefault } from '../consts';
import { useMergedRefs } from './useMergeRefs';

const baseAccessibilityActions =
  Platform.OS === ('win32' as any) ? [{ name: 'Expand' as AccessibilityActionName }, { name: 'Collapse' as AccessibilityActionName }] : [];
const expandedState = { expanded: true };
const collapsedState = { expanded: false };

export const useMenuTrigger = (childProps: MenuTriggerChildProps): MenuTriggerState => {
  const context = useMenuContext();
  const {
    hoverDelay = hoverDelayDefault,
    open,
    openOnHover,
    popoverHoverOutTimer,
    setOpen,
    setTriggerHoverOutTimer,
    triggerHoverOutTimer,
    triggerRef,
  } = context;

  const {
    accessibilityActions: childAccessibilityActions,
    accessibilityState: childAccessibilityState,
    onAccessibilityAction: childOnAccessibilityAction,
    onClick: childOnClick,
    onHoverIn: childOnHoverIn,
    onHoverOut: childOnHoverOut,
    componentRef: childComponentRef,
  } = childProps;

  const accessibilityActions = React.useMemo(() => {
    if (childAccessibilityActions) {
      return [...baseAccessibilityActions, ...childAccessibilityActions];
    }

    return baseAccessibilityActions;
  }, [childAccessibilityActions]);

  const accessibilityState = React.useMemo(() => {
    const baseState = open ? expandedState : collapsedState;

    if (childAccessibilityState) {
      return { ...baseState, ...childAccessibilityState };
    }

    return baseState;
  }, [childAccessibilityState, open]);

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
      childOnAccessibilityAction && childOnAccessibilityAction(e);
    },
    [childOnAccessibilityAction, setOpen],
  );

  const onHoverIn = React.useCallback(
    (e: InteractionEvent) => {
      if (openOnHover) {
        clearTimeout(popoverHoverOutTimer);
        clearTimeout(triggerHoverOutTimer);
        e.persist();
        setTimeout(() => {
          setOpen(e, true /* isOpen */);
        }, hoverDelay);
      }

      childOnHoverIn && childOnHoverIn(e);
    },
    [childOnHoverIn, hoverDelay, openOnHover, setOpen, triggerHoverOutTimer, popoverHoverOutTimer],
  );

  const onHoverOut = React.useCallback(
    (e: InteractionEvent) => {
      if (openOnHover) {
        e.persist();
        const timer = setTimeout(() => {
          setOpen(e, false /* isOpen */);
        }, hoverDelay);
        setTriggerHoverOutTimer(timer);
      }

      childOnHoverOut && childOnHoverOut(e);
    },
    [childOnHoverOut, hoverDelay, openOnHover, setOpen, setTriggerHoverOutTimer],
  );

  const onClick = React.useCallback(
    (e: InteractionEvent) => {
      setOpen(e, !open);
      childOnClick && childOnClick(e);
    },
    [childOnClick, open, setOpen],
  );

  const ref = useMergedRefs(triggerRef, childComponentRef);

  React.useEffect(() => {
    return function cleanup() {
      clearTimeout(triggerHoverOutTimer);
    };
  });

  return {
    props: {
      onClick,
      onHoverIn,
      onHoverOut,
      componentRef: ref,
      accessibilityState,
      accessibilityActions,
      onAccessibilityAction,
    },
    hasSubmenu: context.isSubmenu,
  };
};
