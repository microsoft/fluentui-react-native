/** @jsx withSlots */
import { useState } from 'react';
import { Button, ScrollView, StyleSheet, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/text';

import Drawer from './Drawer';
import { stylingSettings } from './DrawerV1.styling';
import type { DrawerV1Type, DrawerV1Props } from './DrawerV1.types';
import { DrawerV1Name } from './DrawerV1.types';
import { useDrawerV1 } from './useDrawerV1';

export const DrawerV1 = compose<DrawerV1Type>({
  displayName: DrawerV1Name,
  ...stylingSettings,
  slots: {
    root: ScrollView,
  },
  useRender: (userProps: DrawerV1Props, useSlots: UseSlots<DrawerV1Type>) => {
    const DrawerV1 = useDrawerV1(userProps);
    const Slots = useSlots(userProps);

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [drawerPosition, setDrawerPosition] = useState('left');

    const handleDrawerClose = () => {
      setIsDrawerVisible(false);
    };

    const handleOpenDrawer = (position) => {
      setDrawerPosition(position);
      setIsDrawerVisible(true);
    };
    return (final: DrawerV1Props) => {
      const { ...mergedProps } = mergeProps(DrawerV1.props, final);

      return (
        <Slots.root {...mergedProps}>
          <View style={styles.container}>
            <View style={styles.content}>
              <Text style={styles.text}>This is the main content of the screen.</Text>
              <Button title="Open Drawer (Left)" onPress={() => handleOpenDrawer('left')} />
              <Button title="Open Drawer (Right)" onPress={() => handleOpenDrawer('right')} />
              <Button title="Open Drawer (Bottom)" onPress={() => handleOpenDrawer('bottom')} />
              <Button title="Open Drawer (Top)" onPress={() => handleOpenDrawer('top')} />
            </View>
            <Drawer isVisible={isDrawerVisible} onClose={handleDrawerClose} position={drawerPosition}>
              <View style={styles.drawerContent}>
                <Text style={styles.text}>This is the content of the drawer.</Text>
                <Button title="Close Drawer" onPress={handleDrawerClose} />
              </View>
            </Drawer>
          </View>
        </Slots.root>
      );
    };
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
