import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent, View } from 'react-native';
import { Animated, Dimensions, Easing, I18nManager, StatusBar } from 'react-native';

import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

import type { MenuProps, MenuState } from './Menu.types';
import { AndroidMenuStates } from './Menu.types';
import { useMenuContext } from '../context/menuContext';

// Due to how events get fired we get double notifications
// for the same event causing us to immediately reopen
// a menu when we close it. Adding in a delay to prevent
// this behavior.
// This are use when show() function is called to show the Menu
const delayOpen = 150;

/**
 * Values related to Screen Width and Animation Easing
 */

//  Animated easing value for Menu transitions(close and open)
const EASING = Easing.bezier(0.4, 0, 0.2, 1);

// Screen indent is the fixed value according to Android guidelines which depicts the minimum distance from screen edge Menu should have
const SCREEN_INDENT = 16;

export const useMenu = (props: MenuProps): MenuState => {
  /**
   * State , Ref and Context Values for Menu Container and Anchor
   */

  const triggerRef = React.useRef<View>(null);
  const context = useMenuContext();
  const isSubmenu = context.triggerRef !== null;
  const isOpenControlled = typeof props.open !== 'undefined';
  const _container = useRef<View>(null);
  const [menuState, setMenuState] = React.useState<AndroidMenuStates>(AndroidMenuStates.Hidden);

  /**
   * Call for useMenuCheckedState for identifying if any MenuItemCheckbox is checked or not
   */
  const [checked, onCheckedChange] = useMenuCheckedState(props);

  /**
   *  State Variables related to Height,Width and Position of the Menu Popover
   */
  const [maxMenuHeight] = useState(250);
  const [anchorWidth, setAnchorWidth] = React.useState<number>(0);
  const [left, setLeft] = React.useState<number>(0);
  const [menuHeight, setMenuHeight] = React.useState<number>(0);
  const [menuWidth, setMenuWidth] = React.useState<number>(0);
  const [top, setTop] = React.useState<number>(0);

  /**
   *  Animation value for the Menu popover show,hide and opacity values
   */
  const [menuSizeAnimation, setMenuSizeAnimation] = React.useState<Animated.ValueXY>(new Animated.ValueXY({ x: 0, y: 0 }));
  const [opacityAnimation, setOpacityAnimation] = React.useState<Animated.Value>(new Animated.Value(0));

  /**
   * RTL for the MenuItem needs to taken care as well.
   */
  const { isRTL } = I18nManager;

  /**
   * Calcualations related to Menu Popver position and dimensions
   */
  const dimensions = Dimensions.get('screen');
  const { width: windowWidth } = dimensions;
  const windowHeight = dimensions.height - (StatusBar.currentHeight || 0);
  const menuSize = {
    width: menuSizeAnimation.x,
    height: menuSizeAnimation.y,
  };

  /**
   * show function handles the opening of the Menu , it calcuates the position of the Anchor in the screen.
   * It also sets the Anchor width and change the state of the Popover
   */ /**
   * show function handles the opening of the Menu , it calcuates the position of the Anchor in the screen.
   * It also sets the Anchor width and change the state of the Popover
   */

  const show = React.useCallback(() => {
    _container.current?.measureInWindow((left, top, buttonWidth, buttonHeight) => {
      setAnchorWidth(buttonWidth);
      setLeft(left);
      setMenuState(AndroidMenuStates.Shown);
      setTop(top + buttonHeight);
    });
  }, []);

  /**
   * hide function handles the hiding of the Menu when user clicks on the scrim outside Menu or MenuItems such as (MenuItemRadio, MenuItem)
   */
  const hide = React.useCallback(() => {
    Animated.timing(opacityAnimation, {
      toValue: 0,
      duration: 250,
      easing: EASING,
      useNativeDriver: false,
    }).start(() => {
      // Reset state
      setMenuState(AndroidMenuStates.Hidden);
      setMenuSizeAnimation(new Animated.ValueXY({ x: 0, y: 0 }));
      setOpacityAnimation(new Animated.Value(0));
    });
  }, [opacityAnimation]);

  // Hook to maintain the state of the Menu for non controlled and controlled components.
  const [open, shouldFocusOnContainer, setOpen] = useMenuOpenState(isOpenControlled, props, context.setOpen, hide, show);

  /**
   * Checks the value of the open props and show the menu accordingly
   */
  useEffect(() => {
    if (props.open) {
      show();
    }
  }, [props.open, show]);

  /**
   * onMenuLayout handles the start of the Animation when anchor is clicked
   */
  const onMenuLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      if (menuState === AndroidMenuStates.Animating) {
        return;
      }
      const { width, height } = e.nativeEvent.layout;
      setMenuHeight(height);
      setMenuWidth(width);
      setMenuState(AndroidMenuStates.Animating);
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
    },
    [menuSizeAnimation, menuState, opacityAnimation],
  );

  /**
   * onRequestClose handles the closing of the Menu when the MenuItem or scrim or outside is clicked
   */
  const onRequestClose = (e: InteractionEvent) => {
    setOpen(e, false, false);
  };

  // Adjust position of menu - TODO: fix this warning removal, potentially adds extra re-renders

  const transforms = [];

  useMemo(() => {
    /**
     * If the Menu width and SCREEN_INDENT cross the screen width then the Menu will be adjusted to the oppostion left side of the screen
     */
    if ((isRTL && left + anchorWidth - menuWidth > SCREEN_INDENT) || (!isRTL && left + menuWidth > windowWidth - SCREEN_INDENT)) {
      transforms.push({
        translateX: Animated.multiply(menuSizeAnimation.x, -1),
      });
    } else if (left < SCREEN_INDENT) {
      // Setting the left podition of the Menu if the left positon is less than screen indent
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
  }, [
    anchorWidth,
    isRTL,
    left,
    maxMenuHeight,
    menuHeight,
    menuSizeAnimation.x,
    menuSizeAnimation.y,
    menuWidth,
    top,
    transforms,
    windowHeight,
    windowWidth,
  ]);

  /**
   * Styles to be applied on the Modal Popover Animated.View
   */
  const shadowMenuContainerStyle = useMemo(() => {
    return {
      opacity: opacityAnimation,
      transform: transforms,
      top,
      // Switch left to right for rtl devices
      ...(isRTL ? { right: left } : { left }),
    };
  }, [isRTL, left, opacityAnimation, top, transforms]);

  /**
   * handles the state when menu is opening or closing with Animation
   */
  const animationStarted = menuState === AndroidMenuStates.Animating;
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

/**
 * useMenuOpenState handles the open and closing of the Menu based on the click
 * It also takes care of Controlled Menu component by checking open variable
 *
 */
const useMenuOpenState = (
  isControlled: boolean,
  props: MenuProps,
  parentSetOpen: (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => void,
  hide: () => void,
  show: () => void,
): [boolean, boolean, (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => void] => {
  const { defaultOpen, onOpenChange, open } = props;
  const initialState = typeof defaultOpen !== 'undefined' ? defaultOpen : !!open;
  const [openInternal, setOpenInternal] = React.useState<boolean>(initialState);
  const [shouldFocusOnContainer, setShouldFocusOnContainer] = React.useState<boolean | undefined>(undefined);
  const state = isControlled ? open : openInternal;
  const lastCloseTimestampRef = React.useRef<number>(-1);

  /**
   * setOpen handles the open of the Menu and setting focus on the Popover container
   */
  const setOpen = React.useCallback(
    (e: InteractionEvent, isOpen: boolean, bubble?: boolean) => {
      const openPrev = state;
      if (!isControlled && (!isOpen || lastCloseTimestampRef.current + delayOpen <= Date.now())) {
        setOpenInternal(isOpen);
      }
      if (isOpen) {
        show();
        setShouldFocusOnContainer(true);
      }
      if (!isOpen) {
        setShouldFocusOnContainer(undefined);
        lastCloseTimestampRef.current = Date.now();
        hide();
      }
      if (onOpenChange && openPrev !== isOpen) {
        onOpenChange(e, isOpen);
      }
      if (bubble && parentSetOpen && !isControlled) {
        parentSetOpen(e, isOpen, bubble);
      }
    },
    [state, onOpenChange, parentSetOpen, show, hide],
  );
  return [state, shouldFocusOnContainer, setOpen];
};

/**
 * Call for useMenuCheckedState for identifying if any MenuItemCheckbox is checked or not
 */
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
