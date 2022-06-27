import * as React from 'react';
import { AccessibilityState, I18nManager, Platform } from 'react-native';
import { MenuItemProps, MenuItemState } from './MenuItem.types';
import { memoize } from '@fluentui-react-native/framework';
import {
  InteractionEvent,
  isKeyPressEvent,
  useAsPressable,
  useKeyDownProps,
  useViewCommandFocus,
} from '@fluentui-react-native/interactive-hooks';
import { useMenuContext } from '../context/menuContext';
import { useMenuListContext } from '../context/menuListContext';
import { useMenuTriggerContext } from '../context/menuTriggerContext';

export const triggerKeys = [' ', 'Enter'];
export const submenuTriggerKeys = [...triggerKeys, 'ArrowLeft', 'ArrowRight'];

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
      const isRtl = I18nManager.isRTL;

      const isArrowKey = isKeyPressEvent(e) && (e.nativeEvent.key === 'ArrowLeft' || e.nativeEvent.key === 'ArrowRight');
      const isArrowOpen =
        hasSubmenu &&
        isKeyPressEvent(e) &&
        ((isRtl && e.nativeEvent.key === 'ArrowLeft') || (!isRtl && e.nativeEvent.key === 'ArrowRight'));
      const isArrowClose =
        isInSubmenu &&
        isKeyPressEvent(e) &&
        ((isRtl && e.nativeEvent.key === 'ArrowRight') || (!isRtl && e.nativeEvent.key === 'ArrowLeft'));

      if (!disabled && (!isArrowKey || isArrowOpen)) {
        onClick?.(e);
      }

      if (!isArrowKey || isArrowClose) {
        setOpen(e, false /*isOpen*/, !isArrowClose /*bubble*/);
      }
    },
    [disabled, hasSubmenu, isInSubmenu, onClick, setOpen],
  );

  const pressable = useAsPressable({ ...rest, disabled, onPress: onInvoke });
  const itemRef = useViewCommandFocus(componentRef);
  const keys = isSubmenu ? submenuTriggerKeys : triggerKeys;

  // Explicitly override onKeyDown to override the native behavior of moving focus with arrow keys.
  const onKeyDownProps = useKeyDownProps(onInvoke, ...keys);
  const hasCheckmarks = useMenuListContext().hasCheckmarks;

  useHoverFocusEffect(pressable.state.hovered, componentRef);

  return {
    props: {
      ...pressable.props,
      accessible: true,
      accessibilityRole: 'menuitem',
      onAccessibilityTap: props.onAccessibilityTap || onInvoke,
      accessibilityState: getAccessibilityState(disabled, accessibilityState),
      enableFocusRing: Platform.select({
        macos: false,
        default: !pressable.state.hovered, // win32
      }),
      focusable: Platform.select({
        macos: !disabled,
        default: true, // win32
      }),
      ref: itemRef,
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

export const useHoverFocusEffect = (hovered: boolean, componentRef: React.MutableRefObject<any>) => {
  React.useLayoutEffect(() => {
    if (hovered) {
      componentRef?.current?.focus();
    } else {
      componentRef?.current?.blur();
    }
  }, [hovered, componentRef]);
};
