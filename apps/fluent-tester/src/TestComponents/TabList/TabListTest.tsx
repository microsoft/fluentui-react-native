import React from 'react';

import { TabList, Tab } from '@fluentui-react-native/tablist';

import type { PlatformStatus, TestSection } from '../Test';
import { Test } from '../Test';

const TabListMainTest: React.FunctionComponent = () => {
  return (
    <TabList>
      <Tab key="hello">Tab 1</Tab>
      <Tab key="world">Tab 2</Tab>
    </TabList>
  );
};

const sections: TestSection[] = [
  {
    name: 'Main Test',
    component: TabListMainTest,
  },
];

export const TabListTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Backlog',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'With Tabs, users can navigate to another view.';

  return <Test name="TabsV1 Test" description={description} sections={sections} status={status} />;
};
