import * as React from 'react';
import { AccessibilityActionEvent, AccessibilityState } from 'react-native';
import { MenuItemCheckboxProps, MenuItemCheckboxState } from './MenuItemCheckbox.types';
import { memoize } from '@fluentui-react-native/framework';
import {
  InteractionEvent,
  useAsPressable,
  useKeyProps,
  useOnPressWithFocus,
  useViewCommandFocus,
} from '@fluentui-react-native/interactive-hooks';
import { useMenuListContext } from '../context/menuListContext';

const defaultAccessibilityActions = [{ name: 'Toggle' }];

export const useMenuItemCheckbox = (props: MenuItemCheckboxProps): MenuItemCheckboxState => {
  const { name } = props;
  const context = useMenuListContext();
  const checked = context.checked?.[name];
  const onCheckedChange = context.onCheckedChange;

  const toggleChecked = React.useCallback(
    (e: InteractionEvent) => {
      onCheckedChange(e, name, !checked);
    },
    [checked, name, onCheckedChange],
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
    accessibilityState,
    componentRef = defaultComponentRef,
    disabled,
    name,
    onAccessibilityAction,
    ...rest
  } = props;
  const context = useMenuListContext();
  const checked = context.checked?.[name];

  // Ensure focus is placed on checkbox after click
  const toggleCheckedWithFocus = useOnPressWithFocus(componentRef, toggleCallback);

  const pressable = useAsPressable({ onPress: toggleCheckedWithFocus, ...rest });
  const buttonRef = useViewCommandFocus(componentRef);

  const onKeyProps = useKeyProps(toggleCallback, ' ');
  const accessibilityActionsProp = accessibilityActions
    ? [...defaultAccessibilityActions, ...accessibilityActions]
    : defaultAccessibilityActions;
  const onAccessibilityActionProp = React.useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'Toggle') {
        toggleCallback(event);
      }
      onAccessibilityAction && onAccessibilityAction(event);
    },
    [toggleCallback, onAccessibilityAction],
  );

  const state = {
    ...pressable.state,
    disabled: !!props.disabled,
    checked: checked,
  };

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityActions: accessibilityActionsProp,
      accessibilityLabel: props.accessibilityLabel,
      accessibilityRole: 'menuitem',
      accessibilityState: getAccessibilityState(disabled, state.checked, accessibilityState),
      enableFocusRing: true,
      focusable: !disabled,
      onAccessibilityAction: onAccessibilityActionProp,
      ref: buttonRef,
      ...onKeyProps,
    },
    state: state,
  };
};
