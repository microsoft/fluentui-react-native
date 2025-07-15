import * as React from 'react';
import type { AccessibilityState } from 'react-native';
import { I18nManager, Platform } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { isKeyPressEvent, usePressableState, useKeyDownProps, useViewCommandFocus } from '@fluentui-react-native/interactive-hooks';

import type { MenuItemProps, MenuItemInfo } from './MenuItem.types';
import { useMenuContext } from '../context/menuContext';
import { useMenuListContext } from '../context/menuListContext';
import { useMenuTriggerContext } from '../context/menuTriggerContext';
import { useMenuItemTracking } from '../MenuList/useMenuList';

export const triggerKeys = [' ', 'Enter'];
export const submenuTriggerKeys = ['ArrowLeft', 'ArrowRight', ...triggerKeys];

export const useMenuItem = (props: MenuItemProps): MenuItemInfo => {
  // attach the pressable state handlers
  const defaultComponentRef = React.useRef(null);
  const { accessible, onClick, accessibilityState, componentRef = defaultComponentRef, disabled = false, persistOnClick, ...rest } = props;
  const { isSubmenu, persistOnItemClick, setOpen } = useMenuContext();
  const { hasCheckmarks, hasIcons, hasTooltips, onArrowClose } = useMenuListContext();
  const isTrigger = useMenuTriggerContext();
  const shouldPersist = persistOnClick ?? persistOnItemClick;

  const hasSubmenu = isSubmenu && isTrigger;

  const onInvoke = React.useCallback(
    (e: InteractionEvent) => {
      const isRtl = I18nManager.isRTL;
      const isArrowKey = isKeyPressEvent(e) && (e.nativeEvent.key === 'ArrowLeft' || e.nativeEvent.key === 'ArrowRight');
      const isArrowOpen =
        hasSubmenu &&
        isKeyPressEvent(e) &&
        ((isRtl && e.nativeEvent.key === 'ArrowLeft') || (!isRtl && e.nativeEvent.key === 'ArrowRight'));

      if (!disabled && (!isArrowKey || isArrowOpen)) {
        componentRef?.current?.blur();
        onClick?.(e);

        // For RN, ENTER / SPACE keypresses are handled by both the `onKey` event handlers and `onPress` handler. Because we
        // pass this callback into both `onKeyDown` and `onPress` props, we need to mark the event as handled for ENTER / SPACE
        // key presses so that we don't have duplicate `onClick` calls.
        e.preventDefault();
      }

      if (!hasSubmenu && !isArrowKey && !shouldPersist) {
        setOpen(e, false /*isOpen*/, true /*bubble*/);
      }

      const isArrowClose =
        isKeyPressEvent(e) && ((isRtl && e.nativeEvent.key === 'ArrowRight') || (!isRtl && e.nativeEvent.key === 'ArrowLeft'));
      if (isArrowClose) {
        onArrowClose?.(e);
      }
    },
    [componentRef, disabled, hasSubmenu, onArrowClose, onClick, setOpen, shouldPersist],
  );

  const pressable = usePressableState({ ...rest, onPress: onInvoke });
  const itemRef = useViewCommandFocus(componentRef);
  const keys = disabled ? [] : isSubmenu ? submenuTriggerKeys : triggerKeys;

  // Explicitly override onKeyDown to override the native behavior of moving focus with arrow keys.
  const onKeyDownProps = useKeyDownProps(onInvoke, ...keys);

  useHoverFocusEffect(pressable.state.hovered, componentRef);

  const [enableFocusRing, setEnableFocusRing] = React.useState(!pressable.state.hovered);

  const onHoverIn = React.useCallback(
    (e) => {
      pressable.props.onHoverIn(e);
      // when it's a hover focus, set enableFocusRing explicitly to false
      if (!pressable.state.focused) {
        setEnableFocusRing(false);
      }
    },
    [pressable],
  );

  const onFocus = React.useCallback(
    (e) => {
      pressable.props.onFocus(e);
      // when it's not a hover focus, set enableFocusRing explicitly to true
      if (!pressable.state.focused) {
        setEnableFocusRing(true);
      }
    },
    [pressable],
  );

  // Track the ref and disabled props on this menu item so the MenuList can handle Home and End keypresses.
  useMenuItemTracking(componentRef, disabled);

  return {
    props: {
      ...pressable.props,
      onHoverIn: Platform.select({
        macos: pressable.props.onHoverIn,
        default: onHoverIn, // win32
      }),
      onFocus: Platform.select({
        macos: pressable.props.onFocus,
        default: onFocus, // win32
      }),
      accessible: accessible ?? true,
      accessibilityRole: 'menuitem',
      onAccessibilityTap: props.onAccessibilityTap || onInvoke,
      accessibilityState: getAccessibilityState(disabled, accessibilityState),
      disabled,
      enableFocusRing: Platform.select({
        macos: false,
        default: enableFocusRing, // win32
      }),
      focusable: Platform.select({
        macos: !disabled,
        default: true, // win32
      }),
      ref: itemRef,
      ...onKeyDownProps,
    },
    state: {
      ...pressable.state,
      hasSubmenu,
      hasIcons,
      hasCheckmarks,
      hasTooltips,
    },
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
