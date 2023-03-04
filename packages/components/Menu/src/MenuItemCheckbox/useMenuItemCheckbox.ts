import * as React from 'react';
import type { AccessibilityActionEvent, AccessibilityState } from 'react-native';
import { I18nManager, Platform } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import type { InteractionEvent, KeyPressEvent } from '@fluentui-react-native/interactive-hooks';
import { usePressableState, useKeyDownProps, useOnPressWithFocus, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { MenuItemCheckboxProps, MenuItemCheckboxInfo } from './MenuItemCheckbox.types';
import { useMenuContext } from '../context/menuContext';
import { useMenuListContext } from '../context/menuListContext';
import { submenuTriggerKeys, triggerKeys, useHoverFocusEffect, useRemoveHoverEffect } from '../MenuItem/useMenuItem';

const defaultAccessibilityActions = [{ name: 'Toggle' }];

export const useMenuItemCheckbox = (props: MenuItemCheckboxProps): MenuItemCheckboxInfo => {
  const { disabled, name } = props;
  const context = useMenuListContext();
  const checked = context.checked?.[name];
  const onCheckedChange = context.onCheckedChange;

  const toggleChecked = React.useCallback(
    (e: InteractionEvent) => {
      if (!disabled) {
        onCheckedChange(e, name, !checked);
      }
    },
    [checked, disabled, name, onCheckedChange],
  );

  return useMenuCheckboxInteraction(props, toggleChecked);
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, checked: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled, checked, ...accessibilityState };
  }
  return { disabled, checked };
}

/**
 * Create interactivity and accessibility props to be passed into the inner render.
 * This logic is shared between Checkbox and Radio versions of MenuItem.
 *
 * @param props Props passed into the outer compoennt
 * @param toggleCallback Function to be called when item is toggled
 * @returns Props and additional state needed to render the component
 */
export const useMenuCheckboxInteraction = (
  props: MenuItemCheckboxProps,
  toggleCallback: (e: InteractionEvent) => void,
): MenuItemCheckboxInfo => {
  const defaultComponentRef = React.useRef(null);
  const {
    accessibilityActions,
    accessibilityLabel,
    accessibilityState,
    componentRef = defaultComponentRef,
    disabled,
    name,
    onAccessibilityAction,
    ...rest
  } = props;

  const isSubmenu = useMenuContext().isSubmenu;

  const { checked, hasTooltips, onArrowClose, setIsMenuItemHovered } = useMenuListContext();
  const menuListContext = useMenuListContext();
  const isChecked = checked?.[name];

  // Ensure focus is placed on checkbox after click
  const toggleCheckedWithFocus = useOnPressWithFocus(componentRef, toggleCallback);

  const pressable = usePressableState({ ...rest, onPress: toggleCheckedWithFocus });
  const buttonRef = useViewCommandFocus(componentRef);

  const onKeysPressed = React.useCallback(
    (e: KeyPressEvent) => {
      const invokeKey = e.nativeEvent.key === ' ' || e.nativeEvent.key === 'Enter';
      if (!disabled && invokeKey) {
        toggleCallback(e);
        return;
      }

      const isRtl = I18nManager.isRTL;
      const isArrowClose = isSubmenu && ((isRtl && e.nativeEvent.key === 'ArrowRight') || (!isRtl && e.nativeEvent.key === 'ArrowLeft'));

      if (isArrowClose) {
        onArrowClose?.(e);
      }
    },
    [disabled, isSubmenu, onArrowClose, toggleCallback],
  );

  const keys = disabled ? [] : isSubmenu ? submenuTriggerKeys : triggerKeys;
  const onKeyProps = useKeyDownProps(onKeysPressed, ...keys);

  const accessibilityActionsProp = accessibilityActions
    ? [...defaultAccessibilityActions, ...accessibilityActions]
    : defaultAccessibilityActions;
  const onAccessibilityActionProp = React.useCallback(
    (event: AccessibilityActionEvent) => {
      if (!disabled) {
        if (event.nativeEvent.actionName === 'Toggle') {
          toggleCallback(event);
        }
        onAccessibilityAction && onAccessibilityAction(event);
      }
    },
    [disabled, toggleCallback, onAccessibilityAction],
  );

  useHoverFocusEffect(pressable.state.hovered, componentRef, setIsMenuItemHovered);
  useRemoveHoverEffect(pressable.state.hovered, menuListContext.isMenuItemHovered, pressable.props.onHoverOut);

  const state = {
    ...pressable.state,
    checked: isChecked,
    disabled,
    hasTooltips,
  };

  const onFocusOverride = React.useCallback(
    (e) => {
      pressable.props.onFocus(e);
      // if it's not a hover focus
      if (!pressable.state.focused && !pressable.state.hovered) {
        // remove hover state from everywhere else
        setIsMenuItemHovered(false);
      }
    },
    [pressable, setIsMenuItemHovered],
  );

  return {
    props: {
      ...pressable.props,
      onFocus: onFocusOverride,
      accessible: true,
      accessibilityActions: accessibilityActionsProp,
      accessibilityLabel,
      accessibilityRole: 'menuitem',
      accessibilityState: getAccessibilityState(disabled, state.checked, accessibilityState),
      disabled,
      enableFocusRing: Platform.select({
        macos: false,
        default: !pressable.state.hovered, // win32
      }),
      focusable: Platform.select({
        macos: !disabled,
        default: true, // win32
      }),
      onAccessibilityAction: onAccessibilityActionProp,
      ref: buttonRef,
      ...onKeyProps,
    },
    state: state,
  };
};
