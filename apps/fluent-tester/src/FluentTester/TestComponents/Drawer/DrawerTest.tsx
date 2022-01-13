import * as React from 'react';
import { stackStyle } from '../Common/styles';
import { View, Text } from 'react-native';
import { Button } from '@fluentui-react-native/experimental-button';
import { Drawer } from '@fluentui-react-native/experimental-drawer';
import { Stack } from '@fluentui-react-native/stack';
import { DRAWER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const basicDrawer: React.FunctionComponent = () => {

  const stdBtnRef = React.useRef(null);
  const [showDrawer, setShowDrawer] = React.useState(false);
  const toggleShowDrawer = React.useCallback(() => {
    setShowDrawer(!showDrawer);
  }, [showDrawer]);

  return (
    <Stack style={stackStyle} gap={5}>
      <Button componentRef={stdBtnRef} onClick={toggleShowDrawer}>Press for Drawer</Button>
      <Drawer target={stdBtnRef} showDrawer= {showDrawer} toggleShow={toggleShowDrawer}>
        <Button>Press for Drawer</Button>
        <View style={{height: "50%"}}>
          <Text>Text inside Drawer</Text>
          <Text>Text inside Drawer</Text>
          <Text>Text inside Drawer</Text>
          <Text>Text inside Drawer</Text>
          <Text>Text inside Drawer</Text>
          <Text>Text inside Drawer</Text>
        </View>
      </Drawer>
    </Stack>
  );
};

const drawerSections: TestSection[] = [
  {
    name: 'Basic Drawer',
    testID: DRAWER_TESTPAGE,
    component: basicDrawer,
  },
];

export const DrawerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'N/A',
    uwpStatus: 'N/A',
    iosStatus: 'Backlog',
    macosStatus: 'N/A',
    androidStatus: 'Experimental',
  };

  const description =
    'A Drawer component using the Fluent Design System.  Currently only implemented on Android.';

  return <Test name="Drawer Test" description={description} sections={drawerSections} status={status} />;
};
