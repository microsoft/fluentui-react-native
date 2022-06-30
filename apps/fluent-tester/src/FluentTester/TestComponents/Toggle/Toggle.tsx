import * as React from 'react';
import { Test, TestSection, PlatformStatus } from '../Test';
import { TOGGLE_TESTPAGE } from './consts';
import { View } from 'react-native';
import { Toggle } from '@fluentui-react-native/toggle';

const StandardUsage: React.FunctionComponent = () => {
  return (
    <View>
      <Toggle />
    </View>
  );
};

const toggleSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: TOGGLE_TESTPAGE,
    component: () => <StandardUsage />,
  },
];

export const ToggleTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Toggle is a button that has 2 states.';

  return <Test name="Toggle Test" description={description} sections={toggleSections} status={status}></Test>;
};
