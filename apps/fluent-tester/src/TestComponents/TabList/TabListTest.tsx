import React from 'react';
import { View } from 'react-native';

import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { Divider } from '@fluentui-react-native/divider';
import { TABLIST_TESTPAGE } from '@fluentui-react-native/e2e-testing';
import { Menu, MenuTrigger, MenuList, MenuItem, MenuPopover } from '@fluentui-react-native/menu';
import { TabList, Tab } from '@fluentui-react-native/tablist';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { TabListE2ETest } from './TabListE2ETest';
import { svgProps, fontProps } from '../Common/iconExamples';
import { stackStyle } from '../Common/styles';
import type { PlatformStatus, TestSection } from '../Test';
import { Test } from '../Test';

const SubHeader = Text.customize({ variant: 'subheaderStandard' });
const Header = Text.customize({ variant: 'headerStandard' });
const Line = Divider.customize({ paddingVertical: 4 });
const PaddedTabList = TabList.customize({
  paddingVertical: 4,
});

const TabListDefaultTest: React.FunctionComponent = () => {
  const [key, setKey] = React.useState('tab1');
  return (
    <View style={stackStyle}>
      <Header>Uncontrolled Component</Header>
      <Line />
      <PaddedTabList defaultSelectedKey={'tab1'}>
        <Tab tabKey="tab1">Tab 1</Tab>
        <Tab tabKey="tab2">Tab 2</Tab>
        <Tab tabKey="tab3">Tab 3</Tab>
      </PaddedTabList>
      <Header>Controlled Component</Header>
      <Line />
      <Text>Selected Key: {key}</Text>
      <PaddedTabList
        selectedKey={key}
        onTabSelect={(val) => {
          console.log('New key:', val);
          setKey(val);
        }}
      >
        <Tab tabKey="tab1">Tab 1</Tab>
        <Tab tabKey="tab2">Tab 2</Tab>
        <Tab tabKey="tab3">Tab 3</Tab>
      </PaddedTabList>
    </View>
  );
};

const TabListDisabledTest: React.FunctionComponent = () => {
  return (
    <View style={stackStyle}>
      <PaddedTabList defaultSelectedKey="tab2">
        <Tab disabled tabKey="tab1">
          Tab 1
        </Tab>
        <Tab tabKey="tab2">Tab 2</Tab>
        <Tab disabled tabKey="tab3">
          Tab 3
        </Tab>
        <Tab tabKey="tab4">Tab 4</Tab>
      </PaddedTabList>
      <PaddedTabList disabled>
        <Tab tabKey="tab1">Tab 1</Tab>
        <Tab tabKey="tab2">Tab 2</Tab>
        <Tab tabKey="tab3">Tab 3</Tab>
      </PaddedTabList>
    </View>
  );
};

const TabListVariantsTest: React.FunctionComponent = () => {
  return (
    <View style={stackStyle}>
      <Header>Size Variants</Header>
      <Line />
      <SubHeader>Small</SubHeader>
      <PaddedTabList defaultSelectedKey="sm1" size="small">
        <Tab tabKey="sm1">Small Tab 1</Tab>
        <Tab tabKey="sm2">Small Tab 2</Tab>
        <Tab tabKey="sm3">Small Tab 3</Tab>
      </PaddedTabList>
      <SubHeader>Medium (default)</SubHeader>
      <PaddedTabList defaultSelectedKey="m1" size="medium">
        <Tab tabKey="m1">Medium Tab 1</Tab>
        <Tab tabKey="m2">Medium Tab 2</Tab>
        <Tab tabKey="m3">Medium Tab 3</Tab>
      </PaddedTabList>
      <SubHeader>Large</SubHeader>
      <PaddedTabList defaultSelectedKey="lg1" size="large">
        <Tab tabKey="lg1">Large Tab 1</Tab>
        <Tab tabKey="lg2">Large Tab 2</Tab>
        <Tab tabKey="lg3">Large Tab 3</Tab>
      </PaddedTabList>
      <Header>Appearance</Header>
      <Line />
      <SubHeader>Transparent Appearance</SubHeader>
      <PaddedTabList defaultSelectedKey="tab1" appearance="transparent">
        <Tab tabKey="tab1">Tab 1</Tab>
        <Tab tabKey="tab2">Tab 2</Tab>
        <Tab tabKey="tab3">Tab 3</Tab>
      </PaddedTabList>
      <SubHeader>Subtle Appearance</SubHeader>
      <PaddedTabList defaultSelectedKey="tab1" appearance="subtle">
        <Tab tabKey="tab1">Tab 1</Tab>
        <Tab tabKey="tab2">Tab 2</Tab>
        <Tab tabKey="tab3">Tab 3</Tab>
      </PaddedTabList>
      <Header>Vertical Orientation</Header>
      <Line />
      <PaddedTabList defaultSelectedKey="tab1" vertical>
        <Tab tabKey="tab1">Tab 1</Tab>
        <Tab tabKey="tab2">Tab 2</Tab>
        <Tab tabKey="tab3">Tab 3</Tab>
      </PaddedTabList>
    </View>
  );
};

const TabListIconTest: React.FunctionComponent = () => {
  return (
    <View style={stackStyle}>
      <TabList defaultSelectedKey="fontIcon">
        <Tab icon={{ fontSource: fontProps }} tabKey="fontIcon">
          Font Icon
        </Tab>
        <Tab icon={{ fontSource: fontProps }} tabKey="fontIconOnly" />
        <Tab icon={{ svgSource: svgProps }} tabKey="svgIcon">
          SVG Icon
        </Tab>
        <Tab icon={{ svgSource: svgProps }} tabKey="svgIconOnly" />
      </TabList>
    </View>
  );
};

const TabListViewTest: React.FunctionComponent = () => {
  const [key, setKey] = React.useState('a');
  const views = React.useMemo(
    () => ({
      a: (
        <View>
          <SubHeader>This is View 1</SubHeader>
          <Text variant="body1">Here is some text.</Text>
        </View>
      ),
      b: (
        <View>
          <SubHeader>This is View 2</SubHeader>
          <Button>Button 1</Button>
        </View>
      ),
      c: (
        <View>
          <SubHeader>This is View 3</SubHeader>
          <Menu>
            <MenuTrigger>
              <Button>Menu</Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem>Item 1</MenuItem>
                <MenuItem>Item 2</MenuItem>
                <MenuItem>Item 3</MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        </View>
      ),
    }),
    [],
  );
  return (
    <View style={stackStyle}>
      <TabList selectedKey={key} onTabSelect={setKey}>
        <Tab tabKey="a">View 1</Tab>
        <Tab tabKey="b">View 2</Tab>
        <Tab tabKey="c">View 3</Tab>
      </TabList>
      {views[key]}
    </View>
  );
};

const sections: TestSection[] = [
  {
    name: 'TabList Controlled vs Uncontrolled',
    component: TabListDefaultTest,
    testID: TABLIST_TESTPAGE,
  },
  {
    name: 'Disabled',
    component: TabListDisabledTest,
  },
  {
    name: 'Variants',
    component: TabListVariantsTest,
  },
  {
    name: 'Icon',
    component: TabListIconTest,
  },
  {
    name: 'Rendering Content Separately',
    component: TabListViewTest,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E Tests',
    component: TabListE2ETest,
  },
];

export const TabListTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description = 'With Tabs, users can navigate to another view.';

  return <Test name="TabList Test" description={description} sections={sections} status={status} e2eSections={e2eSections} />;
};
