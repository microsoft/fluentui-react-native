/** @jsx withSlots */
import { Animated, Modal, TouchableWithoutFeedback, View, StyleSheet } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './DrawerV1.styling';
import type { DrawerV1Type, DrawerV1Props } from './DrawerV1.types';
import { DrawerV1Name } from './DrawerV1.types';
import { useDrawerV1 } from './useDrawerV1';

export const DrawerV1 = compose<DrawerV1Type>({
  displayName: DrawerV1Name,
  ...stylingSettings,
  slots: {
    modal: Modal,
    backdrop: TouchableWithoutFeedback,
    backdropContent: Animated.View,
    content: Animated.View,
    handle: View,
  },
  useRender: (userProps: DrawerV1Props, useSlots: UseSlots<DrawerV1Type>) => {
    const DrawerV1 = useDrawerV1(userProps);
    const Slots = useSlots(userProps);

    return (final: DrawerV1Props, children: React.ReactNode) => {
      const { visible, onClose, onBackdropClick, animatedOpacity, animatedStyle, position, ...rest } = mergeProps(DrawerV1.props, final);
      return (
        <Slots.modal
          visible={visible}
          onRequestClose={onClose}
          supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
          animationType="none"
          transparent
        >
          <Slots.backdrop onPress={onBackdropClick}>
            <Slots.backdropContent style={[{ opacity: animatedOpacity }]} />
          </Slots.backdrop>
          <Slots.content style={[styles[position], animatedStyle]}>
            {position === 'bottom' && <Slots.handle />}
            {children}
          </Slots.content>
        </Slots.modal>
      );
    };
  },
});

const styles = StyleSheet.create({
  left: {
    left: 0,
    height: '100%',
    width: '70%',
  },
  right: {
    right: 0,
    height: '100%',
    width: '70%',
  },
  bottom: {
    bottom: 0,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    width: '100%',
  },
});
