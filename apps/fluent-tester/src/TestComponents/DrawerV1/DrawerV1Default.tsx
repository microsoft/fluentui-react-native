import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { DrawerV1 as Drawer } from '@fluentui-react-native/drawer';
import { Stack } from '@fluentui-react-native/stack';
import { Text } from '@fluentui-react-native/text';

import { stackStyle } from '../Common/styles';

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
    <Stack style={stackStyle}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text>This is the main content of the screen.</Text>
          <Button appearance="outline" onClick={() => handleOpenDrawer('left')}>
            Open Drawer (Left)
          </Button>
          <Button appearance="outline" onClick={() => handleOpenDrawer('right')}>
            Open Drawer (Right)
          </Button>
          <Button appearance="outline" onClick={() => handleOpenDrawer('bottom')}>
            Open Drawer (Bottom)
          </Button>
        </View>
        <Drawer visible={isDrawerVisible} onClose={handleDrawerClose} onBackdropClick={handleDrawerClose} position={drawerPosition}>
          <View style={styles.drawerContent}>
            <Text style={styles.text}>This is the content of the drawer.</Text>
            <Button appearance="outline" onClick={handleDrawerClose}>
              Close Drawer
            </Button>
            <Button appearance="outline" onClick={() => console.log('Children Clicked')}>
              Validate Children Clicked on Drawer
            </Button>
          </View>
        </Drawer>
      </View>
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    height: 200,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
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
