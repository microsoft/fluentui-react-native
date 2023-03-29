import React from 'react';
import { Animated, Modal, Platform, TouchableWithoutFeedback, View, StyleSheet, ScrollView } from 'react-native';

import { Callout } from '@fluentui-react-native/callout';
import type { UseTokens } from '@fluentui-react-native/framework';
import { compressible, mergeProps, patchTokens, useFluentTheme } from '@fluentui-react-native/framework';

import type { MenuPopoverProps, MenuPopoverTokens } from './MenuPopover.types';
import { menuPopoverName } from './MenuPopover.types';
import { useMenuPopoverTokens } from './MenuPopoverTokens';
import { useMenuPopover } from './useMenuPopover';
import { useMenuContext } from '../context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

export const MenuPopover = compressible<MenuPopoverProps, MenuPopoverTokens>(
  (props: MenuPopoverProps, useTokens: UseTokens<MenuPopoverTokens>) => {
    const {
      directionalHint,
      gapSpace,
      maxHeight,
      maxWidth,
      minWidth,
      minPadding,
      borderWidth,
      borderColor,
      backgroundColor,
      elevation,
      cornerRadius,
    } = props;

    const state = useMenuPopover(props);
    const theme = useFluentTheme();
    const context = useMenuContext();
    let [tokens, cache] = useTokens(theme);

    context.hasMaxHeight = maxHeight != undefined;
    context.minWidth = minWidth ?? context.minWidth;

    [tokens, cache] = patchTokens(tokens, cache, {
      directionalHint,
      gapSpace,
      maxHeight,
      maxWidth,
      cornerRadius,
      elevation,
      minWidth,
      minPadding,
      borderWidth,
      borderColor,
      backgroundColor,
    });

    return (final: MenuPopoverProps, children: React.ReactNode) => {
      const mergedProps = mergeProps(tokens, state.props, final);
      const innerViewProps =
        //For windows platforms, styling needs to be set on container view instead of the callout itself for the scrollview to reflect correct width and height
        Platform.OS === 'windows' || Platform.OS === ('win32' as any)
          ? {
              ...state.innerView,
              style: {
                maxHeight: mergedProps.maxHeight,
              },
            }
          : state.innerView;
      const content = React.createElement(View, innerViewProps, children);

      return Platform.OS === 'android' ? (
        <Modal
          {...mergedProps}
          visible={context.open}
          onRequestClose={context.onRequestClose}
          supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
          transparent
        >
          <TouchableWithoutFeedback onPress={context.onRequestClose} accessible={false}>
            <View style={[StyleSheet.absoluteFill]}>
              {console.log('MEGED', tokens.maxHeight, context.menuHeight)}
              <Animated.View
                onLayout={context.onMenuLayout}
                style={[
                  context.shadowMenuContainerStyle,
                  {
                    maxHeight: mergedProps.maxHeight ? mergedProps.maxHeight : tokens.maxHeight,
                    maxWidth: tokens.maxWidth,
                    position: 'absolute',
                    borderRadius: tokens.cornerRadius,
                    elevation: tokens.elevation,
                    overflow: 'hidden',
                  },
                ]}
              >
                {context.menuHeight + tokens.minPadding >= tokens.maxHeight ||
                context.menuHeight + tokens.minPadding >= mergedProps.maxHeight ? (
                  <AnimatedScrollView style={[context.animationStarted && context.menuSize]}>{children}</AnimatedScrollView>
                ) : (
                  <Animated.View style={[context.animationStarted && context.menuSize]}>{children}</Animated.View>
                )}
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      ) : (
        <Callout {...mergedProps}>{content}</Callout>
      );
    };
  },
  useMenuPopoverTokens,
);

MenuPopover.displayName = menuPopoverName;

export default MenuPopover;
