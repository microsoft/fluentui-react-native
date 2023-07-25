import React from 'react';
import { View, StyleSheet } from 'react-native';

import { Divider } from '@fluentui-react-native/divider';
import { TabList, Tab } from '@fluentui-react-native/tablist';
import { TextV1 as Text } from '@fluentui-react-native/text';

import type { PlatformStatus, TestSection } from '../Test';
import { Test } from '../Test';

const Header = Text.customize({ variant: 'subheaderStandard' });
const Line = Divider.customize({ paddingVertical: 4 });
const PaddedTabList = TabList.customize({
  paddingVertical: 4,
});

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
});

const TabListSizeTest: React.FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <Header>Small</Header>
      <PaddedTabList size="small">
        <Tab tabKey="hello">Tab 1</Tab>
        <Tab tabKey="world">Tab 2</Tab>
      </PaddedTabList>
      <Line />
      <Header>Medium (default)</Header>
      <PaddedTabList size="medium">
        <Tab tabKey="hello">Tab 1</Tab>
        <Tab tabKey="world">Tab 2</Tab>
      </PaddedTabList>
      <Line />
      <Header>Large</Header>
      <PaddedTabList size="large">
        <Tab tabKey="hello">Tab 1</Tab>
        <Tab tabKey="world">Tab 2</Tab>
      </PaddedTabList>
    </View>
  );
};

const TabListVerticalTest: React.FunctionComponent = () => {
  return (
    <TabList vertical>
      <Tab tabKey="hello">Tab 1</Tab>
      <Tab tabKey="world">Tab 2</Tab>
    </TabList>
  );
};

const TabListAppearanceTest: React.FunctionComponent = () => {
  return (
    <View style={styles.container}>
      <Header>Transparent Appearance</Header>
      <PaddedTabList appearance="transparent">
        <Tab tabKey="hello">Tab 1</Tab>
        <Tab tabKey="world">Tab 2</Tab>
      </PaddedTabList>
      <Header>Subtle Appearance</Header>
      <PaddedTabList appearance="subtle">
        <Tab tabKey="hello">Tab 1</Tab>
        <Tab tabKey="world">Tab 2</Tab>
      </PaddedTabList>
    </View>
  );
};

const TabListDisabledTest: React.FunctionComponent = () => {
  return (
    <View>
      <PaddedTabList>
        <Tab disabled tabKey="hello">
          Tab 1
        </Tab>
        <Tab tabKey="world">Tab 2</Tab>
      </PaddedTabList>
      <PaddedTabList disabled>
        <Tab tabKey="hello">Tab 1</Tab>
        <Tab tabKey="world">Tab 2</Tab>
      </PaddedTabList>
    </View>
  );
};

const TabListIconTest: React.FunctionComponent = () => {
  const iconProp = {
    fontSource: {
      fontFamily: 'Arial',
      codepoint: 0x2663,
    },
  };
  return (
    <TabList>
      <Tab icon={iconProp} tabKey="withIcon">
        Tab Item
      </Tab>
      <Tab icon={iconProp} tabKey="iconOnly" />
    </TabList>
  );
};

const sections: TestSection[] = [
  {
    name: 'Size',
    component: TabListSizeTest,
  },
  {
    name: 'Vertical',
    component: TabListVerticalTest,
  },
  {
    name: 'Appearance',
    component: TabListAppearanceTest,
  },
  {
    name: 'Disabled',
    component: TabListDisabledTest,
  },
  {
    name: 'Icon',
    component: TabListIconTest,
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
