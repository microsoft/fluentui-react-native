import { Animated, Modal, TouchableWithoutFeedback, View, StyleSheet, ScrollView } from 'react-native';

import { mergeProps, phasedComponent } from '@fluentui-react-native/framework-base';

import type { MenuCalloutProps } from './MenuCallout.types';
import { menuCalloutName } from './MenuCallout.types';
import { useMenuContext } from '../context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export const MenuCallout = phasedComponent((props: MenuCalloutProps) => {
  const context = useMenuContext();

  return (innerProps: MenuCalloutProps) => {
    const { children, ...rest } = mergeProps<MenuCalloutProps>(props, innerProps);
    const mergedProps = mergeProps(props, rest);
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
