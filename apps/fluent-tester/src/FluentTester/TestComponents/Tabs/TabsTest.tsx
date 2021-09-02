import * as React from 'react';
import { View } from 'react-native';
import { Tabs, TabsItem, Text, Button } from '@fluentui/react-native';
import { stackStyle } from '../Common/styles';
import { TABS_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import TestSvg from './test.svg';

const tabs: React.FunctionComponent = () => {
  return (
    <View style={stackStyle}>
      <Tabs label="Tabs">
        <TabsItem headerText="Home" itemKey="A">
          <Text>Tabs #1</Text>
        </TabsItem>
        <TabsItem headerText="Files" itemKey="B">
          <Text>Tabs #2</Text>
        </TabsItem>
        <TabsItem headerText="Settings" itemKey="C">
          <Text>Tabs #3</Text>
        </TabsItem>
      </Tabs>
    </View>
  );
};

const disabledTabs: React.FunctionComponent = () => {
  return (
    <View style={stackStyle}>
      <Tabs label="Tabs">
        <TabsItem headerText="Home" itemKey="A">
          <Text>Tabs #1</Text>
        </TabsItem>
        <TabsItem headerText="Files" itemKey="B" disabled={true}>
          <Text>Tabs #2</Text>
        </TabsItem>
        <TabsItem headerText="Settings" itemKey="C">
          <Text>Tabs #3</Text>
        </TabsItem>
      </Tabs>
    </View>
  );
};

const tabsCountIcon: React.FunctionComponent = () => {
  const svgExample = {
    svgSource: {
      src: TestSvg,
      viewBox: '0 0 500 500',
    },
    width: 20,
    height: 20,
  };

  return (
    <View style={stackStyle}>
      <Tabs label="Tabs">
        <TabsItem headerText="Home" itemKey="A" icon={svgExample} itemCount={23}>
          <Text>Tabs #1</Text>
        </TabsItem>
        <TabsItem itemKey="B" icon={svgExample} itemCount={0}>
          <Text>Tabs #2</Text>
        </TabsItem>
        <TabsItem itemKey="C" icon={svgExample}>
          <Text>Tabs #3</Text>
        </TabsItem>
      </Tabs>
    </View>
  );
};

const onTabsClickEvent: React.FunctionComponent = () => {
  const [selectedKey, setSelectedKey] = React.useState('home_key');

  const onTabsClick = (key: string) => {
    setSelectedKey(key);
  };

  return (
    <View style={stackStyle}>
      <Text>Last onTabsClick from: {selectedKey}</Text>
      <Tabs label="Tabs" onTabsClick={onTabsClick} selectedKey={selectedKey}>
        <TabsItem headerText="Home" itemKey="home_key">
          <Text>Tabs #1</Text>
        </TabsItem>
        <TabsItem headerText="Files" itemKey="files_key">
          <Text>Tabs #2</Text>
        </TabsItem>
        <TabsItem headerText="Settings" itemKey="settings_key">
          <Text>Tabs #3</Text>
        </TabsItem>
      </Tabs>
    </View>
  );
};

const tabsChangingViews: React.FunctionComponent = () => {
  // If user wants to control what gets rendered example.
  const [selectedKey, setSelectedKey] = React.useState('Tabs #1');

  const onTabsClick = (key: string) => {
    setSelectedKey(key);
  };

  return (
    <View style={stackStyle}>
      <Tabs label="Tabs" onTabsClick={onTabsClick} headersOnly={true} selectedKey={selectedKey}>
        <TabsItem headerText="Home" itemKey="Tabs #1" />
        <TabsItem headerText="File" itemKey="Tabs #2" />
        <TabsItem headerText="Settings" itemKey="Tabs #3" />
      </Tabs>
      <View style={{ marginVertical: 1 }}>
        <Text>{selectedKey}</Text>
      </View>
    </View>
  );
};

const tabsRenderSeparately: React.FunctionComponent = () => {
  const [selectedKey, setSelectedKey] = React.useState('rectangleRed');

  const onTabsClick = (key: string) => {
    setSelectedKey(key);
  };

  const getTabId = (key: string) => {
    return `ShapeColorTabs_${key}`;
  };

  return (
    <View style={stackStyle}>
      <View
        accessible={true}
        focusable={true}
        accessibilityLabel={getTabId(selectedKey)}
        style={{
          width: 100,
          height: selectedKey === 'squareRed' ? 100 : 200,
          backgroundColor: selectedKey === 'rectangleGreen' ? 'green' : 'red',
        }}
      />
      <Tabs label="Tabs" onTabsClick={onTabsClick} getTabId={getTabId} headersOnly={true} selectedKey={selectedKey}>
        <TabsItem headerText="Rectangle Red" itemKey="rectangleRed" />
        <TabsItem headerText="Square Red" itemKey="squareRed" />
        <TabsItem headerText="Rectangle Green" itemKey="rectangleGreen" />
      </Tabs>
    </View>
  );
};

const tabsSettingSelectedKey: React.FunctionComponent = () => {
  // If user wants to programmatically set the tab's selectedKey with a button example.
  const [selectedKey, setSelectedKey] = React.useState('home');
  const [currTabItemIndex, setCurrTabItemIndex] = React.useState(0);
  const tabItems = ['home', 'file', 'setting'];

  const goToNextTab = () => {
    const newCurrTabItemIndex = (currTabItemIndex + 1) % 3;
    setCurrTabItemIndex(newCurrTabItemIndex);
    setSelectedKey(tabItems[newCurrTabItemIndex]);
  };

  return (
    <View style={stackStyle}>
      <Tabs label="Tabs" selectedKey={selectedKey} isCircularNavigation={true}>
        <TabsItem headerText="Home" itemKey="home">
          <Text>Tabs #1</Text>
        </TabsItem>
        <TabsItem headerText="File" itemKey="file">
          <Text>Tabs #2</Text>
        </TabsItem>
        <TabsItem headerText="Setting" itemKey="setting">
          <Text>Tabs #3</Text>
        </TabsItem>
      </Tabs>
      <Button content="View Next Tab" onClick={goToNextTab} />
    </View>
  );
};

const tabsWithFlexibility: React.FunctionComponent = () => {
  const [selectedKey, setSelectedKey] = React.useState('home');

  const goHomeTab = () => {
    setSelectedKey('home');
  };

  const onTabsClick = (key: string) => {
    setSelectedKey(key);
  };

  return (
    <View style={stackStyle}>
      <Tabs selectedKey={selectedKey} onTabsClick={onTabsClick} isCircularNavigation={true}>
        <TabsItem headerText="Home" itemKey="home">
          <Text>Tabs #1</Text>
        </TabsItem>
        <TabsItem headerText="File" itemKey="file">
          <Text>Tabs #2</Text>
        </TabsItem>
        <TabsItem headerText="Setting" itemKey="setting">
          <Text>Tabs #3</Text>
        </TabsItem>
      </Tabs>
      <Button content="View Home Tab" onClick={goHomeTab} />
    </View>
  );
};

const tabsSections: TestSection[] = [
  {
    name: 'Default Tabs',
    testID: TABS_TESTPAGE,
    component: tabs,
  },
  {
    name: 'Tabs with disabled',
    component: disabledTabs,
  },
  {
    name: 'Count and Icon',
    component: tabsCountIcon,
  },
  {
    name: 'Trigger onTabsClick event',
    component: onTabsClickEvent,
  },
  {
    name: 'User Custom Render',
    component: tabsChangingViews,
  },
  {
    name: 'Render Content Separately',
    component: tabsRenderSeparately,
  },
  {
    name: 'Override Selected Key',
    component: tabsSettingSelectedKey,
  },
  {
    name: 'More Flexibility',
    component: tabsWithFlexibility,
  },
];

export const TabsTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'With Tabs, users can navigate to another view.';

  return <Test name="Tabs Test" description={description} sections={tabsSections} status={status} />;
};
