import * as React from 'react';
import { Alert } from 'react-native';
import { Tabs, TabsItem } from '@fluentui/react-native';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { TABS_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { SvgIconProps } from '@fluentui-react-native/icon';

import TestSvg from './test.svg';

const tabs: React.FunctionComponent<{}> = () => {
  const onTabsClick = (key: string) => {
    //Alert.alert('Alert.', key + ' works');
  };

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  return (
    <Stack style={stackStyle}>
      <Tabs label="Tabs">
        <TabsItem icon={{ svgSource: svgProps, width: 20, height: 20, color: 'red' }} headerText="Option A!" buttonKey="A" />
        <TabsItem headerText="Option B" buttonKey="B" />
        <TabsItem headerText="Option C" buttonKey="C" />
        <TabsItem headerText="Option D" buttonKey="D" />
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
