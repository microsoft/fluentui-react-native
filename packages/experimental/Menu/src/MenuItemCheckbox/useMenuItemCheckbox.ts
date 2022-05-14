import * as React from 'react';
import { AccessibilityState } from 'react-native';
import { MenuItemCheckboxProps, MenuItemCheckboxState } from './MenuItemCheckbox.types';
import { memoize } from '@fluentui-react-native/framework';
import { useAsPressable, useKeyProps } from '@fluentui-react-native/interactive-hooks';
import { useMenuContext } from '../context/menuContext';

export const useMenuItemCheckbox = (props: MenuItemCheckboxProps): MenuItemCheckboxState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onClick, accessibilityState, componentRef = defaultComponentRef, disabled, ...rest } = props;
  const pressable = useAsPressable({ ...rest, disabled, onPress: onClick });
  const onKeyProps = useKeyProps(onClick, ' ', 'Enter');
  const hasSubmenu = useMenuContext().isSubmenu;

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'button',
      onAccessibilityTap: props.onAccessibilityTap || props.onClick,
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: getAccessibilityState(disabled, accessibilityState),
      enableFocusRing: true,
      focusable: !disabled,
      hasSubmenu,
      ref: componentRef,
      ...onKeyProps,
    },
    state: pressable.state,
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled, ...accessibilityState };
  }
  return { disabled };
}
