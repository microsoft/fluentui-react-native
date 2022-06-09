import * as React from 'react';
import { AccessibilityState, I18nManager } from 'react-native';
import { MenuItemProps, MenuItemState } from './MenuItem.types';
import { memoize } from '@fluentui-react-native/framework';
import { InteractionEvent, isKeyPressEvent, useAsPressable, useKeyDownProps } from '@fluentui-react-native/interactive-hooks';
import { useMenuContext } from '../context/menuContext';
import { useMenuListContext } from '../context/menuListContext';
import { useMenuTriggerContext } from '../context/menuTriggerContext';

const triggerKeys = [' ', 'Enter'];
const submenuTriggerKeys = [...triggerKeys, 'ArrowLeft', 'ArrowRight'];

export const useMenuItem = (props: MenuItemProps): MenuItemState => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { onClick, accessibilityState, componentRef = defaultComponentRef, disabled, ...rest } = props;
  const isTrigger = useMenuTriggerContext();
  const isSubmenu = useMenuContext().isSubmenu;
  const hasSubmenu = isSubmenu && isTrigger;
  const isInSubmenu = isSubmenu && !isTrigger;

  const setOpen = useMenuContext().setOpen;
  const onInvoke = React.useCallback(
    (e: InteractionEvent) => {
      if (disabled) {
        return;
      }

      const isRtl = I18nManager.isRTL;
      if (
        isKeyPressEvent(e) &&
        hasSubmenu &&
        ((isRtl && e.nativeEvent.key === 'ArrowRight') || (!isRtl && e.nativeEvent.key === 'ArrowLeft'))
      ) {
        return;
      }
      if (
        isKeyPressEvent(e) &&
        isInSubmenu &&
        ((isRtl && e.nativeEvent.key === 'ArrowLeft') || (!isRtl && e.nativeEvent.key === 'ArrowRight'))
      ) {
        return;
      }

      onClick?.(e);
      if (!hasSubmenu) {
        const isArrowClose =
          isKeyPressEvent(e) &&
          isInSubmenu &&
          ((isRtl && e.nativeEvent.key === 'ArrowRight') || (!isRtl && e.nativeEvent.key === 'ArrowLeft'));

        setOpen(e, false /*isOpen*/, !isArrowClose /*bubble*/);
      }
    },
    [disabled, hasSubmenu, isInSubmenu, onClick, setOpen],
  );

  const pressable = useAsPressable({ ...rest, disabled, onPress: onInvoke });
  const keys = isSubmenu ? submenuTriggerKeys : triggerKeys;

  // Explicitly override onKeyDown to override the native behavior of moving focus with arrow keys.
  const onKeyDownProps = useKeyDownProps(onInvoke, ...keys);
  const hasCheckmarks = useMenuListContext().hasCheckmarks;

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'menuitem',
      onAccessibilityTap: props.onAccessibilityTap || onInvoke,
      accessibilityLabel: props.accessibilityLabel || props.content,
      accessibilityState: getAccessibilityState(disabled, accessibilityState),
      enableFocusRing: true,
      focusable: true,
      ref: componentRef,
      ...onKeyDownProps,
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
