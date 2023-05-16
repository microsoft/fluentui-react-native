/** @jsx withSlots */
import { Animated, Modal, TouchableWithoutFeedback, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';

import { stylingSettings } from './Drawer.styling';
import type { DrawerType, DrawerProps } from './Drawer.types';
import { DrawerName } from './Drawer.types';
import { useDrawer } from './useDrawer';

export const drawerLookup = (layer: string, userProps: DrawerProps): boolean => {
  return userProps[layer] || layer === userProps['position'];
};

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
    const drawerProps = useDrawer(userProps).props;
    const Slots = useSlots(userProps, (layer) => drawerLookup(layer, drawerProps));

    return (final: DrawerProps, children: React.ReactNode) => {
      const { visible, onClose, onBackdropClick, animationConfig, position, ...rest } = mergeProps(drawerProps, final);
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
          <Slots.content style={animationConfig.animatedStyle}>
            {position === 'bottom' && <Slots.handle />}
            {children}
          </Slots.content>
        </Slots.modal>
      );
    };
  },
});
