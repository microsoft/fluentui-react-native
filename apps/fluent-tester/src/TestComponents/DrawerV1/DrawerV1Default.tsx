import * as React from 'react';
import { Button, StyleSheet, View } from 'react-native';

import { DrawerV1 as Drawer } from '@fluentui-react-native/drawer';
import { Text } from '@fluentui-react-native/text';

export const DrawerV1Default: React.FunctionComponent = () => {
  const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);
  const [drawerPosition, setDrawerPosition] = React.useState('left');

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
  };

  const handleOpenDrawer = (position) => {
    setDrawerPosition(position);
    setIsDrawerVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>This is the main content of the screen.</Text>
        <Button title="Open Drawer (Left)" onPress={() => handleOpenDrawer('left')} />
        <Button title="Open Drawer (Right)" onPress={() => handleOpenDrawer('right')} />
        <Button title="Open Drawer (Bottom)" onPress={() => handleOpenDrawer('bottom')} />
      </View>
      <Drawer isVisible={isDrawerVisible} onClose={handleDrawerClose} position={drawerPosition}>
        <View style={styles.drawerContent}>
          <Text style={styles.text}>This is the content of the drawer.</Text>
          <Button title="Close Drawer" onPress={handleDrawerClose} />
          <Button title="Validate Children Clicked on Drawer" onPress={() => console.log('Children Clicked')} />
        </View>
      </Drawer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerContent: {
    flex: 1,
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});
