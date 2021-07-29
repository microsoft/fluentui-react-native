import * as React from 'react';
import { View } from 'react-native';
import { Tabs, TabsItem, Text } from '@fluentui/react-native';
import { stackStyle } from '../Common/styles';
import { TABS_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { SvgIconProps } from '@fluentui-react-native/icon';
import { Button } from '@fluentui-react-native/button';

import TestSvg from './test.svg';

const tabs: React.FunctionComponent<{}> = () => {
  const onTabsClick = (key: string) => {
    console.log(`onTabsClick works ${key}`);
  };

  const svgProps: SvgIconProps = {
    src: TestSvg,
    viewBox: '0 0 500 500',
  };

  return (
    <View style={stackStyle}>
      <Tabs label="Tabs" defaultSelectedKey="B" onTabsClick={onTabsClick} isCircularNavigation={true}>
        <TabsItem icon={{ svgSource: svgProps, width: 20, height: 20, color: 'red' }} headerText="Option A!" itemKey="A">
          <Text>This is option A&apos;s content</Text>
        </TabsItem>
        <TabsItem headerText="Option B" itemKey="B">
          <Text>This is option B&apos;s content</Text>
        </TabsItem>
        <TabsItem headerText="Option C" itemKey="C" disabled={true} >
          <Text>This is option C&apos;s content</Text>
        </TabsItem>
        <TabsItem headerText="Option D" itemKey="D" >
          <Text>This is option D&apos;s content</Text>
        </TabsItem>
      </Tabs>
    </View>
  );
};

{
  /* If User wants to control what gets rendered example */
}
const tabChangingViews: React.FunctionComponent<{}> = () => {
  const [selectedKey, setSelectedKey] = React.useState('home');

  const onTabsClick = (key: string) => {
    setSelectedKey(key);
  };

  const getTabId = (key: string, index: number) => {
    return `getTabId works ${key} ${index}`;
  };

  return (
    <View style={stackStyle}>
      <Tabs label="Tabs" onTabsClick={onTabsClick} getTabId={getTabId} headersOnly={true}>
        <TabsItem headerText="Home" itemKey="home" />
        <TabsItem headerText="File" itemKey="file" disabled={true} />
        <TabsItem headerText="Settings" itemKey="settings" />
      </Tabs>
      <View style={{ marginVertical: 1 }}>
        {selectedKey == 'home' && <Text>This is home</Text>}
        {selectedKey == 'file' && <Text>This is file</Text>}
        {selectedKey == 'settings' && <Text>This is settings</Text>}
      </View>
    </View>
  );
};

{
  /* If user wants to programmtically set the selectedKey to control the view */
}
const tabsSettingSelectedKey: React.FunctionComponent<{}> = () => {
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
          <Text>This is Home&apos;s content</Text>
        </TabsItem>
        <TabsItem headerText="File" itemKey="file">
          <Text>This is Files&apos;s content</Text>
        </TabsItem>
        <TabsItem headerText="Setting" itemKey="setting" >
          <Text>This is Settings&apos;s content</Text>
        </TabsItem>
      </Tabs>
      <Button content="View Next Tab" onClick={goToNextTab}/>
    </View>
  );
};

const tabsSections: TestSection[] = [
  {
    name: 'Navigation and Alert',
    testID: TABS_TESTPAGE,
    component: tabs,
  },
  {
    name: 'Navigation with Content',
    component: tabChangingViews,
  },
  {
    name: 'Override Selected Key',
    component: tabsSettingSelectedKey
  }
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
