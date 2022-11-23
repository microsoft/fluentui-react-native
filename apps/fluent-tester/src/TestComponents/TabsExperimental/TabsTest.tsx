import * as React from 'react';
import { View, Platform } from 'react-native';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { Button } from '@fluentui-react-native/experimental-button';
import { Tabs, TabsItem } from '@fluentui-react-native/experimental-tabs';
import { stackStyle } from '../Common/styles';
import { EXPERIMENTAL_TABS_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { E2ETestExperimentalTabs } from './TabsExperimentalE2ETest';
import { svgProps } from '../Common/iconExamples';

const TabsMainTest: React.FunctionComponent = () => {
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

const DisabledTabs: React.FunctionComponent = () => {
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

const TabsCountIcon: React.FunctionComponent = () => {
  return (
    <View style={stackStyle}>
      <Tabs label="Tabs">
        <TabsItem headerText="Home" itemKey="A" icon={{ svgSource: svgProps, width: 20, height: 20, style: { margin: 5 } }} itemCount={23}>
          <Text>Tabs #1</Text>
        </TabsItem>
        <TabsItem itemKey="B" icon={{ svgSource: svgProps, width: 20, height: 20 }} itemCount={0}>
          <Text>Tabs #2</Text>
        </TabsItem>
        <TabsItem itemKey="C" icon={{ svgSource: svgProps, width: 20, height: 20 }}>
          <Text>Tabs #3</Text>
        </TabsItem>
      </Tabs>
    </View>
  );
};

const TabsClickEventTest: React.FunctionComponent = () => {
  const [selectedKey, setSelectedKey] = React.useState('home_key');

  const onTabsClick = React.useCallback(
    (key: string) => {
      setSelectedKey(key);
    },
    [setSelectedKey],
  );

  return (
    <View style={stackStyle}>
      <Text>{'Last onTabsClick from: ' + selectedKey}</Text>
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

const TabsChangingViews: React.FunctionComponent = () => {
  // If User wants to control what gets rendered example
  const [selectedKey, setSelectedKey] = React.useState('home');

  const onTabsClick = React.useCallback(
    (key: string) => {
      setSelectedKey(key);
    },
    [setSelectedKey],
  );

  return (
    <View style={stackStyle}>
      <Tabs label="Tabs" onTabsClick={onTabsClick} headersOnly={true} selectedKey={selectedKey}>
        <TabsItem headerText="Home" itemKey="home" />
        <TabsItem headerText="File" itemKey="file" />
        <TabsItem headerText="Settings" itemKey="settings" />
      </Tabs>
      <View style={{ marginVertical: 1 }}>
        {selectedKey == 'home' && <Text>Tabs #1</Text>}
        {selectedKey == 'file' && <Text>Tabs #2</Text>}
        {selectedKey == 'settings' && <Text>Tabs #3</Text>}
      </View>
    </View>
  );
};

const TabsRenderSeparately: React.FunctionComponent = () => {
  const [selectedKey, setSelectedKey] = React.useState('rectangleRed');

  const onTabsClick = React.useCallback(
    (key: string) => {
      setSelectedKey(key);
    },
    [setSelectedKey],
  );

  const getTabId = (key: string) => {
    return `ShapeColorPivot_${key}`;
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

const TabsSettingSelectedKey: React.FunctionComponent = () => {
  // If user wants to programmatically set the selectedKey to control the view
  const [selectedKey, setSelectedKey] = React.useState('home');
  const [currTabItemIndex, setCurrTabItemIndex] = React.useState(0);
  const tabItems = ['home', 'file', 'setting'];

  const goToNextTab = React.useCallback(() => {
    const newCurrTabItemIndex = (currTabItemIndex + 1) % 3;
    setCurrTabItemIndex(newCurrTabItemIndex);
    setSelectedKey(tabItems[newCurrTabItemIndex]);
  }, [currTabItemIndex]);

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
      <Button onClick={goToNextTab}>View Next Tab</Button>
    </View>
  );
};

const TabsWithFlexibility: React.FunctionComponent = () => {
  const [selectedKey, setSelectedKey] = React.useState('home');

  const goHomeTab = React.useCallback(() => {
    setSelectedKey('home');
  }, [setSelectedKey]);

  const onTabsClick = React.useCallback(
    (key: string) => {
      setSelectedKey(key);
    },
    [setSelectedKey],
  );

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
      <Button onClick={goHomeTab}>View Home Tab</Button>
    </View>
  );
};

const tabsSections: TestSection[] = [
  {
    name: 'Default Tabs',
    testID: EXPERIMENTAL_TABS_TESTPAGE,
    component: TabsMainTest,
  },
  {
    name: 'Tabs with disabled',
    component: DisabledTabs,
  },
  {
    name: 'Trigger onTabsClick event',
    component: TabsClickEventTest,
  },
  {
    name: 'User Custom Render',
    component: TabsChangingViews,
  },
  {
    name: 'Render Content Separately',
    component: TabsRenderSeparately,
  },
  {
    name: 'Override Selected Key',
    component: TabsSettingSelectedKey,
  },
  {
    name: 'More Flexibility',
    component: TabsWithFlexibility,
  },
  {
    name: 'E2E Testing Experimental Tabs',
    component: E2ETestExperimentalTabs,
  },
];

if (Platform.OS !== 'windows') {
  tabsSections.push({
    name: 'Count and Icon',
    component: TabsCountIcon,
  });
}

export const ExperimentalTabsTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Backlog',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'With Tabs, users can navigate to another view.';

  return <Test name="Experimental Tabs Test" description={description} sections={tabsSections} status={status} />;
};
