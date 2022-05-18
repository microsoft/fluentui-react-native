import * as React from 'react';
import { AccessibilityState } from 'react-native';
import { MenuItemProps, MenuItemState } from './MenuItem.types';
import { memoize } from '@fluentui-react-native/framework';
import { useAsPressable, useKeyProps } from '@fluentui-react-native/interactive-hooks';
import { useMenuContext } from '../context/menuContext';
import { useMenuListContext } from '../context/menuListContext';

export const useMenuItem = (props: MenuItemProps): MenuItemState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onClick, accessibilityState, componentRef = defaultComponentRef, disabled, ...rest } = props;
  const pressable = useAsPressable({ ...rest, disabled, onPress: onClick });
  const onKeyProps = useKeyProps(onClick, ' ', 'Enter');
  const hasSubmenu = useMenuContext().isSubmenu;
  const hasCheckmarks = useMenuListContext().hasCheckmarks;

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'menuitem',
      onAccessibilityTap: props.onAccessibilityTap || props.onClick,
      accessibilityLabel: props.accessibilityLabel,
      accessibilityState: getAccessibilityState(disabled, accessibilityState),
      enableFocusRing: true,
      focusable: !disabled,
      ref: componentRef,
      ...onKeyProps,
    },
    state: pressable.state,
    hasSubmenu,
    hasCheckmarks,
  };
};

const getAccessibilityState = memoize(getAccessibilityStateWorker);
function getAccessibilityStateWorker(disabled: boolean, accessibilityState?: AccessibilityState) {
  if (accessibilityState) {
    return { disabled, ...accessibilityState };
  }
  return { disabled };
}
