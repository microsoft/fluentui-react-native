import React, { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';
import { Animated, Dimensions, Easing, I18nManager, StatusBar } from 'react-native';

import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

import type { MenuProps, MenuState } from './Menu.types';
import { useMenuContext } from '../context/menuContext';
// Due to how events get fired we get double notifications
// for the same event causing us to immediately reopen
// a menu when we close it. Adding in a delay to prevent
// this behavior.
const delayOpen = 150;
let lastCloseTimestamp = -1;

enum States {
  Hidden,
  Animating,
  Shown,
}
const EASING = Easing.bezier(0.4, 0, 0.2, 1);
const SCREEN_INDENT = 16;

export const useMenu = (props: MenuProps): MenuState => {
  const triggerRef = React.useRef();
  const context = useMenuContext();
  const isSubmenu = context.triggerRef !== null;
  const isOpenControlled = typeof props.open !== 'undefined';
  const [checked, onCheckedChange] = useMenuCheckedState(props);

  const _container = useRef<View>(null);
  const [menuState, setMenuState] = React.useState<States>(States.Hidden);
  const [, setAnchorHeight] = React.useState<number>(0);
  const [maxMenuHeight] = useState(250);
  const [anchorWidth, setAnchorWidth] = React.useState<number>(0);
  const [left, setLeft] = React.useState<number>(0);
  const [menuHeight, setMenuHeight] = React.useState<number>(0);
  const [menuWidth, setMenuWidth] = React.useState<number>(0);
  const [top, setTop] = React.useState<number>(0);
  const [menuSizeAnimation, setMenuSizeAnimation] = React.useState<Animated.ValueXY>(new Animated.ValueXY({ x: 0, y: 0 }));
  const [opacityAnimation, setOpacityAnimation] = React.useState<Animated.Value>(new Animated.Value(0));

  const show = React.useCallback(() => {
    _container.current?.measureInWindow((left, top, buttonWidth, buttonHeight) => {
      setAnchorHeight(buttonHeight);
      setAnchorWidth(buttonWidth);
      setLeft(left);
      setMenuState(States.Shown);
      setTop(top + buttonHeight);
    });
    console.log('open');
  }, []);

  const hide = () => {
    Animated.timing(opacityAnimation, {
      toValue: 0,
      duration: 250,
      easing: EASING,
      useNativeDriver: false,
    }).start(() => {
      // Reset state
      setMenuState(States.Hidden);
      setMenuSizeAnimation(new Animated.ValueXY({ x: 0, y: 0 }));
      setOpacityAnimation(new Animated.Value(0));
    });
    console.log('hide');
  };

  const [open, shouldFocusOnContainer, setOpen] = useMenuOpenState(isOpenControlled, props, context.setOpen, hide, show);

  useEffect(() => {
    if (!props.visible) {
      return;
    }
    show();
  }, [props.visible]);
  useEffect(() => {
    if (props.visible) {
      show();
    } else {
      hide();
    }
  }, [props.visible]);

  const onMenuLayout = (e: LayoutChangeEvent) => {
    if (menuState === States.Animating) {
      return;
    }
    const { width, height } = e.nativeEvent.layout;
    setMenuHeight(height);
    setMenuWidth(width);
    setMenuState(States.Animating);
    Animated.parallel([
      Animated.timing(menuSizeAnimation, {
        toValue: { x: width, y: height },
        duration: 100,
        easing: EASING,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnimation, {
        toValue: 1,
        duration: 100,
        easing: EASING,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const onRequestClose = (e) => {
    setOpen(e, false, false);
  };
  const { isRTL } = I18nManager;
  const dimensions = Dimensions.get('window');
  const { width: windowWidth } = dimensions;
  const windowHeight = dimensions.height - (StatusBar.currentHeight || 0);
  const menuSize = {
    width: menuSizeAnimation.x,
    height: menuSizeAnimation.y,
  };
  // Adjust position of menu
  const transforms = [];
  if ((isRTL && left + anchorWidth - menuWidth > SCREEN_INDENT) || (!isRTL && left + menuWidth > windowWidth - SCREEN_INDENT)) {
    transforms.push({
      translateX: Animated.multiply(menuSizeAnimation.x, -1),
    });
    setLeft(Math.min(windowWidth - SCREEN_INDENT, left + anchorWidth));
  } else if (left < SCREEN_INDENT) {
    setLeft(SCREEN_INDENT);
  }
  // Flip by Y axis if menu hits bottom screen border
  if (top + menuHeight + SCREEN_INDENT > windowHeight) {
    if (menuHeight > maxMenuHeight) {
      transforms.push({
        translateY: Animated.multiply(menuSizeAnimation.y, -1),
      });
    } else {
      transforms.push({
        translateY: Animated.multiply(menuSizeAnimation.y, -1),
      });
    }
  } else if (top < SCREEN_INDENT) {
    setTop(SCREEN_INDENT);
  }

  const shadowMenuContainerStyle = {
    opacity: opacityAnimation,
    transform: transforms,
    top,
    // Switch left to right for rtl devices
    ...(isRTL ? { right: left } : { left }),
  };
  const animationStarted = menuState === States.Animating;
  const { testID } = props;
  // Default behavior for submenu is to open on hover
  // the ...props line below will override this behavior for a submenu
  // or apply openOnHover if passed into a root Menu.
  const openOnHover = isSubmenu;
  // We need to be able to cancel the timer that gets set on
  // hover out of the parent popover if the parent popover
  // is also set to open/close on hover out. Otherwise
  // the parent menu will close when the timeout passes.
  const parentPopoverHoverOutTimer = isSubmenu ? context.popoverHoverOutTimer : undefined;
  return {
    openOnHover,
    ...props,
    open,
    setOpen,
    shouldFocusOnContainer,
    triggerRef,
    isSubmenu,
    isControlled: isOpenControlled,
    parentPopoverHoverOutTimer,
    setAnchorHeight,
    setAnchorWidth,
    shadowMenuContainerStyle,
    _container,
    onRequestClose,
    onMenuLayout,
    checked,
    onCheckedChange,
    menuHeight,
    maxMenuHeight,
    animationStarted,
    menuSize,
    testID,
  };
};

const useMenuOpenState = (
  isControlled: boolean,
  props: MenuProps,
  parentSetOpen: (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => void,
  hide,
  show,
): [boolean, boolean, (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => void] => {
  const { defaultOpen, onOpenChange, open } = props;
  const initialState = typeof defaultOpen !== 'undefined' ? defaultOpen : !!open;
  const [openInternal, setOpenInternal] = React.useState<boolean>(initialState);
  const [shouldFocusOnContainer] = React.useState<boolean | undefined>(undefined);
  const state = isControlled ? open : openInternal;
  const setOpen = React.useCallback(
    (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => {
      const openPrev = state;
      if (!isControlled && (!isOpen || lastCloseTimestamp + delayOpen <= Date.now())) {
        setOpenInternal(isOpen);
      }
      if (isOpen) {
        show();
        // setShouldFocusOnContainer(false);
      }
      if (!isOpen) {
        // setShouldFocusOnContainer(undefined);
        lastCloseTimestamp = Date.now();
        hide();
      }
      if (onOpenChange && openPrev !== isOpen) {
        onOpenChange(e, isOpen);
      }
      if (bubble && parentSetOpen) {
        parentSetOpen(e, isOpen, bubble);
      }
    },
    [state, isControlled, onOpenChange, parentSetOpen, show, hide],
  );
  return [state, shouldFocusOnContainer, setOpen];
};

const useMenuCheckedState = (props: MenuProps): [string[], (e: InteractionEvent, checked: string[]) => void] => {
  const { checked, defaultChecked, onCheckedChange: onCheckedChangeOriginal } = props;
  const [checkedInternal, setCheckedInternal] = React.useState(defaultChecked ?? checked ?? []);
  const isControlled = typeof checked !== 'undefined';
  const state = isControlled ? checked : checkedInternal;
  const onCheckedChange = React.useCallback(
    (e: InteractionEvent, checked: string[]) => {
      if (!isControlled) {
        setCheckedInternal(checked);
      }
      onCheckedChangeOriginal?.(e, checked);
    },
    [isControlled, setCheckedInternal, onCheckedChangeOriginal],
  );
  return [state, onCheckedChange];
};
