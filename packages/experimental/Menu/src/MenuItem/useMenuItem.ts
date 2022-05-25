import * as React from 'react';
import { AccessibilityState } from 'react-native';
import { MenuItemProps, MenuItemState } from './MenuItem.types';
import { memoize } from '@fluentui-react-native/framework';
import { InteractionEvent, useAsPressable, useKeyProps } from '@fluentui-react-native/interactive-hooks';
import { useMenuContext } from '../context/menuContext';
import { useMenuListContext } from '../context/menuListContext';
import { useMenuTriggerContext } from '../context/menuTriggerContext';

export const useMenuItem = (props: MenuItemProps): MenuItemState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onClick, accessibilityState, componentRef = defaultComponentRef, disabled, ...rest } = props;

  const setOpen = useMenuContext().setOpen;
  const onInvoke = React.useCallback(
    (e: InteractionEvent) => {
      onClick && onClick(e);
      setOpen(e, false /*isOpen*/);
    },
    [onClick, setOpen],
  );
  const pressable = useAsPressable({ ...rest, disabled, onPress: onInvoke });
  const onKeyProps = useKeyProps(onInvoke, ' ', 'Enter');
  const isTrigger = useMenuTriggerContext();
  const hasSubmenu = useMenuContext().isSubmenu && isTrigger;
  const hasCheckmarks = useMenuListContext().hasCheckmarks;

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'menuitem',
      onAccessibilityTap: props.onAccessibilityTap || onInvoke,
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
