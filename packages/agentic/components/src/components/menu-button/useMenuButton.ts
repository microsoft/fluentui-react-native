import * as React from 'react';
import type { View } from 'react-native';

import type { FocusIntent, FocusKeyboardEvent, FocusRequest, FocusTarget } from '@fluentui-react-native/framework-base';
import { useSlot } from '@fluentui-react-native/framework-base';

import { semanticIconSources } from '../../common/iconSources';
import { withTriggerExpandActions } from '../../common/triggerExpandActions';
import { Icon } from '../../primitives/icon/icon';
import type { ButtonProps } from '../button/button.types';
import { useButton_unstable } from '../button/useButton';
import { MenuItemMenuContext } from '../menu-item/menuItemContext';
import { useMenuController } from '../menu/menuFamily';
import { composeHandlers, useMenuChildrenWarning } from '../menu/useMenu';
import type { MenuButtonProps, MenuButtonState } from './menu-button.types';

const defaultHint = 'Opens a menu';
const chevronProps = { fontSource: semanticIconSources.chevronDown };
const triggerKeys = [{ key: 'ArrowDown' }, { key: 'ArrowUp' }];
const unmounted: FocusRequest = { status: 'not-mounted', cancel: () => undefined };

type TriggerInstance = React.ComponentRef<typeof View>;

/**
 * Resolves MenuButton state: Button's trigger state on one Pressable, the private chevron, and the root of the menu's
 * native popup family, which opens below the trigger and continues Tab past it.
 */
export function useMenuButton_unstable(props: MenuButtonProps): MenuButtonState {
  const {
    accessibilityHint,
    accessibilityState,
    children,
    defaultOpen,
    disabledFocusable,
    keyDownEvents,
    menu,
    onKeyDown,
    onOpenChange,
    onPress,
    onPressIn,
    open,
    submenuCloseDelay,
    submenuOpenDelay,
    submenuOpenOnHover,
    ...buttonProps
  } = props;

  const inMenu = React.useContext(MenuItemMenuContext) !== undefined;
  React.useEffect(() => {
    if (!__DEV__) {
      return;
    }
    if (inMenu) {
      console.warn('MenuButton: do not render a MenuButton inside a menu; use a MenuItem submenu.');
    }
    if (buttonProps.content == null && buttonProps.icon == null) {
      console.warn('MenuButton: supply a label, a leading icon, or both.');
    }
    React.Children.forEach(children, (child) => {
      if (React.isValidElement<{ menuStyle?: string }>(child) && child.props.menuStyle === 'section-header') {
        console.warn('MenuButton: its menu is a flat list of actions; do not compose section headers.');
      }
    });
  }, [buttonProps.content, buttonProps.icon, children, inMenu]);
  useMenuChildrenWarning('MenuButton', children);

  // The controller restores focus to the Button's own focus target, which exists only after the Button state below.
  const triggerTarget = React.useRef<FocusTarget | null>(null);
  const [triggerFocus] = React.useState(() => ({
    requestFocus: (intent?: FocusIntent) => triggerTarget.current?.requestFocus(intent) ?? unmounted,
  }));

  const disabled = buttonProps.disabled === true;
  const controller = useMenuController({
    componentName: 'MenuButton',
    children,
    defaultOpen,
    disabledFocusable,
    label: typeof buttonProps.content === 'string' ? buttonProps.content : undefined,
    onOpenChange,
    open,
    placement: { side: 'bottom', align: 'start' },
    submenuCloseDelay,
    submenuOpenDelay,
    submenuOpenOnHover,
    surface: menu,
    tabNavigation: 'continue',
    triggerDisabled: disabled,
    triggerFocusTarget: triggerFocus,
  });

  const { openFromKey } = controller;
  const handleKeyDown = React.useCallback(
    (event: FocusKeyboardEvent) => {
      onKeyDown?.(event);
      const { key, altKey, ctrlKey, metaKey, shiftKey } = event.nativeEvent;
      if (disabled || altKey || ctrlKey || metaKey || shiftKey) {
        return;
      }
      if (key === 'ArrowDown' || key === 'ArrowUp') {
        openFromKey(key === 'ArrowDown' ? 'first' : 'last');
      }
    },
    [disabled, onKeyDown, openFromKey],
  );

  const button = useButton_unstable(
    withTriggerExpandActions<ButtonProps>(
      {
        ...buttonProps,
        accessibilityHint: accessibilityHint ?? defaultHint,
        accessibilityState: { ...accessibilityState, expanded: controller.presented },
        keyDownEvents: [...(keyDownEvents ?? []), ...triggerKeys],
        onKeyDown: handleKeyDown,
        onPress: composeHandlers(onPress, controller.handlePress),
        onPressIn: composeHandlers(controller.handlePressIn, onPressIn),
        shape: 'rounded',
      },
      controller.setExpanded,
    ),
  );
  const { focusTarget } = button;
  React.useLayoutEffect(() => {
    triggerTarget.current = focusTarget;
  }, [focusTarget]);

  const { focusTargetRef } = button;
  const { anchorRef } = controller;
  const triggerRef = React.useCallback(
    (instance: TriggerInstance | null) => {
      const detachFocus = focusTargetRef(instance);
      const detachAnchor = anchorRef(instance);
      return () => {
        if (typeof detachFocus === 'function') detachFocus();
        if (typeof detachAnchor === 'function') detachAnchor();
      };
    },
    [anchorRef, focusTargetRef],
  );
  const chevron = useSlot(Icon, chevronProps);

  return {
    ...button,
    chevron,
    triggerRef,
    open: controller.presented,
    popupProps: controller.popupProps,
    anchorRef: controller.anchorRef,
  };
}
