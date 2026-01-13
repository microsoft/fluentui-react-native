import React from 'react';
import { Animated, Modal, TouchableWithoutFeedback, View, StyleSheet, ScrollView } from 'react-native';

import { stagedComponent } from '@fluentui-react-native/framework';
import { mergeProps } from '@fluentui-react-native/framework';

import type { MenuCalloutProps } from './MenuCallout.types';
import { menuCalloutName } from './MenuCallout.types';
import { useMenuContext } from '../context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export const MenuCallout = stagedComponent((props: MenuCalloutProps) => {
  const context = useMenuContext();

  return (_rest: MenuCalloutProps, children: React.ReactNode) => {
    const mergedProps = mergeProps(props, _rest);
    const tokens = props.tokens;

    return (
      <Modal
        {...mergedProps}
        visible={context.open}
        onRequestClose={context.onRequestClose}
        supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
        transparent
      >
        <TouchableWithoutFeedback onPress={context.onRequestClose} accessible={false}>
          <View style={[StyleSheet.absoluteFill]}>
            <Animated.View
              onLayout={context.onMenuLayout}
              style={[
                context.shadowMenuContainerStyle,
                {
                  maxHeight: mergedProps.maxHeight ? mergedProps.maxHeight : tokens.maxHeight,
                  maxWidth: tokens.maxWidth,
                  position: 'absolute',
                  borderRadius: tokens.borderRadius,
                  elevation: tokens.elevation,
                  overflow: 'hidden',
                },
              ]}
            >
              {context.menuHeight + tokens.minPadding >= (tokens.maxHeight as number) ||
              context.menuHeight + tokens.minPadding >= (mergedProps.maxHeight as number) ? (
                <AnimatedScrollView style={[context.animationStarted && context.menuSize]}>{children}</AnimatedScrollView>
              ) : (
                <Animated.View style={[context.animationStarted && context.menuSize]}>{children}</Animated.View>
              )}
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };
});

MenuCallout.displayName = menuCalloutName;

export default MenuCallout;
