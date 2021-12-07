import * as React from 'react';
import { Text } from 'react-native';
import { stackStyle } from '../Common/styles';
import { Stack } from '@fluentui-react-native/stack';
import { DRAWER_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { NativeModules } from 'react-native';

const basicDrawer: React.FunctionComponent = () => {
  console.log(NativeModules.DrawerModule);
  return (
    <Stack style={stackStyle} gap={5}>
      <Text>test to come</Text>
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
