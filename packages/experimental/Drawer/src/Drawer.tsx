/** @jsxImportSource @fluentui-react-native/framework-base */
import { Animated, Modal, TouchableWithoutFeedback, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';

import { stylingSettings } from './Drawer.styling';
import type { DrawerType, DrawerProps } from './Drawer.types';
import { DrawerName } from './Drawer.types';
import { useDrawer } from './useDrawer';

export const drawerLookup = (layer: string, userProps: DrawerProps): boolean => {
  return userProps[layer] || layer === userProps['drawerPosition'];
};

export const Drawer = compose<DrawerType>({
  displayName: DrawerName,
  ...stylingSettings,
  slots: {
    modal: Modal,
    scrim: TouchableWithoutFeedback,
    scrimContent: Animated.View,
    content: Animated.View,
    handle: View,
  },
  useRender: (userProps: DrawerProps, useSlots: UseSlots<DrawerType>) => {
    const drawerProps = useDrawer(userProps).props;
    const Slots = useSlots(userProps, (layer) => drawerLookup(layer, drawerProps));
    return (final: DrawerProps, children: React.ReactNode) => {
      const { open, onClose, onScrimClick, animationConfig, drawerPosition, showHandle, ...rest } = mergeProps(drawerProps, final);
      return (
        <Slots.modal
          {...rest}
          visible={open}
          onRequestClose={onClose}
          supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
          animationType="none"
          transparent
        >
          <Slots.scrim onPress={onScrimClick}>
            <Slots.scrimContent style={[{ opacity: animationConfig.animatedOpacity }]} />
          </Slots.scrim>
          <Slots.content style={animationConfig.animatedStyle}>
            {drawerPosition === 'bottom' && showHandle && <Slots.handle />}
            {children}
          </Slots.content>
        </Slots.modal>
      );
    };
  },
});
