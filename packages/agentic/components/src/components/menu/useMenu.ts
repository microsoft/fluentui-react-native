import * as React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemeState } from '@fluentui-react-native/design';
import { useAccessibilityLabelWarning, useFocusTarget, useSlot } from '@fluentui-react-native/framework-base';

import { Button } from '../button/button';
import type { ButtonProps } from '../button/button.types';
import { useMenuController } from './menuFamily';
import type { MenuProps, MenuState } from './menu.types';

const defaultTriggerHint = 'Opens a menu';
const hostPrimitives = new Set<unknown>([Pressable, Text, View]);

export function composeHandlers<TArgs extends unknown[]>(...handlers: (((...args: TArgs) => void) | undefined)[]) {
  return (...args: TArgs) => {
    for (const handler of handlers) {
      handler?.(...args);
    }
  };
}

/** Warns in development for menu children that cannot be rows: text and host primitives. */
export function useMenuChildrenWarning(componentName: string, children: React.ReactNode) {
  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }
    React.Children.forEach(children, (child) => {
      if (typeof child === 'string' || typeof child === 'number' || (React.isValidElement(child) && hostPrimitives.has(child.type))) {
        console.warn(`${componentName}: compose only MenuItem rows and Dividers.`);
      }
    });
  }, [children, componentName]);
}

/**
 * Resolves Menu state: the trigger slot and the root of its native popup family. Native presence is authoritative; a
 * native dismissal latches a controlled request closed until it is rearmed.
 */
export function useMenu_unstable(props: MenuProps): MenuState {
  const {
    align = 'center',
    children,
    defaultOpen,
    disabledFocusable,
    onOpenChange,
    open,
    placement = 'bottom',
    style: userStyle,
    submenuCloseDelay,
    submenuOpenDelay,
    submenuOpenOnHover,
    surface,
    trigger: triggerProp,
    ...rootProps
  } = props;
  const themeState = useThemeState();
  const triggerDisabled = triggerProp.disabled === true;
  const triggerFocus = useFocusTarget(!triggerDisabled);
  const label = typeof triggerProp.content === 'string' ? triggerProp.content : undefined;

  useAccessibilityLabelWarning({
    componentName: 'Menu',
    accessibilityLabel: surface?.accessibilityLabel ?? surface?.['aria-label'] ?? label,
    accessibilityLabelledBy: surface?.accessibilityLabelledBy ?? surface?.['aria-labelledby'],
    requireLabel: true,
    warning: 'Menu: name the menu with surface.accessibilityLabel or string trigger content.',
  });
  useMenuChildrenWarning('Menu', children);

  const controller = useMenuController({
    componentName: 'Menu',
    children,
    defaultOpen,
    disabledFocusable,
    label,
    onOpenChange,
    open,
    placement: { side: placement, align },
    submenuCloseDelay,
    submenuOpenDelay,
    submenuOpenOnHover,
    surface,
    tabNavigation: 'dismiss',
    triggerDisabled,
    triggerFocusTarget: triggerFocus.focusTarget,
  });

  const root = useSlot(View, rootProps);
  const trigger = useSlot(Button, triggerProp, {
    transform: (slotProps: ButtonProps) => ({
      ...slotProps,
      accessibilityHint: slotProps.accessibilityHint ?? defaultTriggerHint,
      accessibilityState: { ...slotProps.accessibilityState, expanded: controller.presented },
      onBlur: composeHandlers(slotProps.onBlur, triggerFocus.onBlur),
      onFocus: composeHandlers(slotProps.onFocus, triggerFocus.onFocus),
      onPress: composeHandlers(slotProps.onPress, controller.handlePress),
      onPressIn: composeHandlers(controller.handlePressIn, slotProps.onPressIn),
      ref: triggerFocus.focusTargetRef,
    }),
  });

  return {
    ...themeState,
    root,
    trigger,
    open: controller.presented,
    popupProps: controller.popupProps,
    anchorRef: controller.anchorRef,
    userStyle,
  };
}
