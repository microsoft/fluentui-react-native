import React, { useEffect, useRef } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Animated, Easing, Modal, TouchableWithoutFeedback, View, StyleSheet, I18nManager, StatusBar, Dimensions } from 'react-native';

import { stagedComponent } from '@fluentui-react-native/framework';

import type { MenuProps } from './Menu.types';
import { menuName } from './Menu.types';
import { useMenu } from './useMenu';
import { useMenuContextValue } from './useMenuContextValue';
import { MenuProvider } from '../context/menuContext';
enum States {
  Hidden,
  Animating,
  Shown,
}
const EASING = Easing.bezier(0.4, 0, 0.2, 1);
const SCREEN_INDENT = 8;
export const Menu = stagedComponent((props: MenuProps) => {
  const _container = useRef<View>(null);
  const [menuState, setMenuState] = React.useState<States>(States.Hidden);
  const [buttonHeight, setButtonHeight] = React.useState<number>(0);
  const [buttonWidth, setButtonWidth] = React.useState<number>(0);
  const [left, setLeft] = React.useState<number>(0);
  const [menuHeight, setMenuHeight] = React.useState<number>(0);
  const [menuWidth, setMenuWidth] = React.useState<number>(0);
  const [top, setTop] = React.useState<number>(0);
  const [menuSizeAnimation, setMenuSizeAnimation] = React.useState<Animated.ValueXY>(new Animated.ValueXY({ x: 0, y: 0 }));
  const [opacityAnimation, setOpacityAnimation] = React.useState<Animated.Value>(new Animated.Value(0));
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
  const show = () => {
    _container.current?.measureInWindow((left, top, buttonWidth, buttonHeight) => {
      setButtonHeight(buttonHeight);
      setButtonWidth(buttonWidth);
      setLeft(left);
      setMenuState(States.Shown);
      setTop(top + buttonHeight);
    });
  };
  const hide = () => {
    Animated.timing(opacityAnimation, {
      toValue: 0,
      duration: 100,
      easing: EASING,
      useNativeDriver: false,
    }).start(() => {
      // Reset state
      setMenuState(States.Hidden);
      setMenuSizeAnimation(new Animated.ValueXY({ x: 0, y: 0 }));
      setOpacityAnimation(new Animated.Value(0));
    });
  };
  const onRequestClose = (e) => {
    state.setOpen(e, false, false);
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
  if ((isRTL && left + buttonWidth - menuWidth > SCREEN_INDENT) || (!isRTL && left + menuWidth > windowWidth - SCREEN_INDENT)) {
    transforms.push({
      translateX: Animated.multiply(menuSizeAnimation.x, -1),
    });
    setLeft(Math.min(windowWidth - SCREEN_INDENT, left + buttonWidth));
  } else if (left < SCREEN_INDENT) {
    setLeft(SCREEN_INDENT);
  }
  // Flip by Y axis if menu hits bottom screen border
  if (top > windowHeight - menuHeight - SCREEN_INDENT) {
    transforms.push({
      translateY: Animated.multiply(menuSizeAnimation.y, -1),
    });
    setTop(windowHeight - SCREEN_INDENT);
    setTop(Math.min(windowHeight - SCREEN_INDENT, top + buttonHeight));
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
  const menuState1 = menuState;
  const animationStarted = menuState1 === States.Animating;
  const { testID, style } = props;
  const state = useMenu(props, hide, show);
  const contextValue = useMenuContextValue(state);
  return (_rest: MenuProps, children: React.ReactNode) => {
    const childrenArray = React.Children.toArray(children) as React.ReactElement[];
    if (__DEV__) {
      if (childrenArray.length !== 2) {
        // eslint-disable-next-line no-console
        console.warn('Menu must contain two children');
      }
    }
    const menuTrigger = childrenArray[0];
    const menuPopover = childrenArray[1];
    return (
      <MenuProvider value={contextValue}>
        {menuTrigger}
        <View ref={_container} collapsable={false} testID={testID}>
          <Modal
            visible={state.open}
            onRequestClose={onRequestClose}
            supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
            transparent
          >
            <TouchableWithoutFeedback onPress={onRequestClose} accessible={false}>
              <View style={StyleSheet.absoluteFill}>
                <Animated.View onLayout={onMenuLayout} style={[styles.shadowMenuContainer, shadowMenuContainerStyle, style]}>
                  <Animated.View style={[styles.menuContainer, animationStarted && menuSize]}>{menuPopover}</Animated.View>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
      </MenuProvider>
    );
  };
});
const styles = StyleSheet.create({
  shadowMenuContainer: {
    position: 'absolute',
  },
  menuContainer: {
    overflow: 'hidden',
  },
});
Menu.displayName = menuName;
export default Menu;
