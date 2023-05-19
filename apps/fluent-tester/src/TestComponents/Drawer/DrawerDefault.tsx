import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@fluentui-react-native/avatar';
import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Drawer } from '@fluentui-react-native/drawer';
import type { DrawerPositionType } from '@fluentui-react-native/drawer';
import { Stack } from '@fluentui-react-native/stack';
import { Switch } from '@fluentui-react-native/switch';
import { Text } from '@fluentui-react-native/text';

import { stackStyle } from '../Common/styles';

export const DrawerDefault: React.FunctionComponent = () => {
  const [isDrawerVisible, setIsDrawerVisible] = React.useState(false);
  const [drawerPosition, setDrawerPosition] = React.useState<DrawerPositionType>('left');

  const handleDrawerClose = React.useCallback(() => {
    setIsDrawerVisible(false);
  }, []);

  const handleDrawerOpen = React.useCallback((behavior) => {
    setDrawerPosition(behavior);
    setIsDrawerVisible(true);
  }, []);

  const handleChildrenClick = React.useCallback(() => {
    console.log('Children Clicked');
  }, []);

  return (
    <Stack style={stackStyle}>
      <View style={drawerContentstyles.container}>
        <View style={drawerContentstyles.content}>
          <Text>This is the main content of the screen.</Text>
          <Button appearance="outline" onClick={() => handleDrawerOpen('left')}>
            Open Drawer (Left)
          </Button>
          <Button appearance="outline" onClick={() => handleDrawerOpen('right')}>
            Open Drawer (Right)
          </Button>
          <Button appearance="outline" onClick={() => handleDrawerOpen('bottom')}>
            Open Drawer (Bottom)
          </Button>
        </View>
        <Drawer open={isDrawerVisible} onClose={handleDrawerClose} onScrimClick={handleDrawerClose} drawerPosition={drawerPosition}>
          <View style={drawerContentstyles.drawerContent}>
            <View style={drawerContentstyles.flexRow}>
              <Avatar active={'active'} activeAppearance="ring" size={56} name="John Doe" avatarColor={'colorful'} />
              <Text variant="headerSemibold" style={drawerContentstyles.text}>
                John Doe
              </Text>
            </View>
            <Switch style={drawerContentstyles.switch} defaultChecked={true} label={'Notifications'} />
            <Stack gap={10}>
              <Text variant="body1">This is the content of the drawer.</Text>
              <Button onClick={handleDrawerClose}>Close Drawer</Button>
              <Button appearance="outline" onClick={handleChildrenClick}>
                Validate Children Clicked on Drawer
              </Button>
            </Stack>
          </View>
        </Drawer>
      </View>
    </Stack>
  );
};

const drawerContentstyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flexRow: {
    flexDirection: 'row',
  },
  content: {
    height: 200,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switch: {
    margin: 10,
  },
  drawerContent: {
    flex: 1,
    alignItems: 'flex-start',
    margin: 20,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
    alignSelf: 'center',
    marginStart: 10,
  },
});
