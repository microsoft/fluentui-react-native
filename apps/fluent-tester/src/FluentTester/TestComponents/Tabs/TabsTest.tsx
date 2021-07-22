import * as React from 'react';
import { Alert } from 'react-native';
import { Tabs, TabsItem } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { TABS_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const tabs: React.FunctionComponent<{}> = () => {
  const onTabsClick = (key: string) => {
    Alert.alert('Alert.', key + ' works');
  };

  return (
    <Stack style={stackStyle}>
      <Tabs label="Tabs" onTabsClick={onTabsClick}>
        <TabsItem content="Option A" buttonKey="A" />
        <TabsItem content="Option B" buttonKey="B" />
        <TabsItem content="Option C" buttonKey="C" />
        <TabsItem content="Option D" buttonKey="D" />
      </Tabs>
    </Stack>
  );
};

const tabsSections: TestSection[] = [
  {
    name: 'Navigation and Alert',
    testID: TABS_TESTPAGE,
    component: tabs,
  },
];

export const TabsTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Backlog',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'With Tabs, users can navigate to another view.';

  return <Test name="Tabs Test" description={description} sections={tabsSections} status={status}></Test>;
};
