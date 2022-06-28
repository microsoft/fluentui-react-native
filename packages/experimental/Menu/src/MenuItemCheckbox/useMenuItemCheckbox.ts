import * as React from 'react';
import { AccessibilityActionEvent, AccessibilityState, I18nManager, Platform } from 'react-native';
import { MenuItemCheckboxProps, MenuItemCheckboxState } from './MenuItemCheckbox.types';
import { memoize } from '@fluentui-react-native/framework';
import {
  InteractionEvent,
  KeyPressEvent,
  useAsPressable,
  useKeyDownProps,
  useOnPressWithFocus,
  useViewCommandFocus,
} from '@fluentui-react-native/interactive-hooks';
import { useMenuListContext } from '../context/menuListContext';
import { submenuTriggerKeys, triggerKeys, useHoverFocusEffect } from '../MenuItem/useMenuItem';
import { useMenuContext } from '../context/menuContext';

const defaultAccessibilityActions = [{ name: 'Toggle' }];

export const useMenuItemCheckbox = (props: MenuItemCheckboxProps): MenuItemCheckboxState => {
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
): MenuItemCheckboxState => {
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

  const { checked, onArrowClose } = useMenuListContext();
  const isChecked = checked?.[name];

  // Ensure focus is placed on checkbox after click
  const toggleCheckedWithFocus = useOnPressWithFocus(componentRef, toggleCallback);

  const pressable = useAsPressable({ ...rest, disabled, onPress: toggleCheckedWithFocus });
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

  const keys = isSubmenu ? submenuTriggerKeys : triggerKeys;
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

  useHoverFocusEffect(pressable.state.hovered, componentRef);

  const state = {
    ...pressable.state,
    disabled: !!props.disabled,
    checked: isChecked,
  };

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityActions: accessibilityActionsProp,
      accessibilityLabel,
      accessibilityRole: 'menuitem',
      accessibilityState: getAccessibilityState(disabled, state.checked, accessibilityState),
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
