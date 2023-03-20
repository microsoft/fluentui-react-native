import React from 'react';
import { ScrollView } from 'react-native';
import { Animated, Modal, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';

import { stagedComponent } from '@fluentui-react-native/framework';

import type { MenuProps } from './Menu.types';
import { menuName } from './Menu.types';
import { useMenu } from './useMenu';
import { useMenuContextValue } from './useMenuContextValue';
import { MenuProvider } from '../context/menuContext';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export const Menu = stagedComponent((props: MenuProps) => {
  const state = useMenu(props);
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
        <View
          onLayout={(event) => {
            const { height, width } = event.nativeEvent.layout;
            state.setAnchorHeight(height);
            state.setAnchorWidth(width);
          }}
        >
          {menuTrigger}
        </View>
        <View ref={state._container} collapsable={false} testID={state.testID}>
          <Modal
            visible={state.open}
            onRequestClose={state.onRequestClose}
            supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
            transparent
          >
            <TouchableWithoutFeedback onPress={state.onRequestClose} accessible={false}>
              <View style={StyleSheet.absoluteFill}>
                <Animated.View onLayout={state.onMenuLayout} style={[styles.shadowMenuContainer, state.shadowMenuContainerStyle]}>
                  {state.menuHeight > 250 ? (
                    <AnimatedScrollView style={[styles.menuContainer, state.animationStarted && state.menuSize]}>
                      {menuPopover}
                    </AnimatedScrollView>
                  ) : (
                    <Animated.View style={[styles.menuContainer, state.animationStarted && state.menuSize]}>{menuPopover}</Animated.View>
                  )}
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
    borderRadius: 8,
    maxHeight: 400,

    // Shadow
    elevation: 16,
  },
  menuContainer: {
    overflow: 'hidden',
  },
});
Menu.displayName = menuName;
export default Menu;
