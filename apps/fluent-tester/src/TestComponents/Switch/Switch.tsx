import * as React from 'react';
import { Test, TestSection, PlatformStatus } from '../Test';
import { SWITCH_TESTPAGE } from './consts';
import { View } from 'react-native';
import { Switch } from '@fluentui-react-native/switch';
const StandardUsage: React.FunctionComponent = () => {
  return (
    <View>
      <Switch
        onChange={(e, s) => {
          console.log(s);
        }}
        defaultChecked={true}
        label={'demo'}
        labelPosition={'above'}
      />
    </View>
  );
};

const toggleSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: SWITCH_TESTPAGE,
    component: () => <StandardUsage />,
  },
];

export const SwitchTest: React.FunctionComponent = () => {
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
