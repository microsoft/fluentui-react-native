/** @jsx withSlots */
import { Animated, Modal, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './Drawer.styling';
import type { DrawerType, DrawerProps } from './Drawer.types';
import { DrawerName } from './Drawer.types';
import { useDrawer } from './useDrawer';

export const Drawer = compose<DrawerType>({
  displayName: DrawerName,
  ...stylingSettings,
  slots: {
    modal: Modal,
    backdrop: TouchableWithoutFeedback,
    backdropContent: Animated.View,
    content: Animated.View,
    handle: View,
  },
  useRender: (userProps: DrawerProps, useSlots: UseSlots<DrawerType>) => {
    const Drawer = useDrawer(userProps);
    const Slots = useSlots(userProps);

    return (final: DrawerProps, children: React.ReactNode) => {
      const { visible, onClose, onBackdropClick, animationConfig, position, ...rest } = mergeProps(Drawer.props, final);
      return (
        <Slots.modal
          {...rest}
          visible={visible}
          onRequestClose={onClose}
          supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
          animationType="none"
          transparent
        >
          <Slots.backdrop onPress={onBackdropClick}>
            <Slots.backdropContent style={[{ opacity: animationConfig.animatedOpacity }]} />
          </Slots.backdrop>
          <Slots.content style={[styles[position], animationConfig.animatedStyle]}>
            {position === 'bottom' && <Slots.handle />}
            {children}
          </Slots.content>
        </Slots.modal>
      );
    };
  },
});

// To be moved to tokens files in later PRs
const styles = StyleSheet.create({
  left: {
    left: 0,
    height: '100%',
    width: '80%',
  },
  right: {
    right: 0,
    height: '100%',
    width: '80%',
  },
  bottom: {
    bottom: 0,
    width: '100%',
  },
});
