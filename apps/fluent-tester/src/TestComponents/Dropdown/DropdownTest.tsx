import * as React from 'react';
import { Option } from '@fluentui-react-native/dropdown';
import { Stack } from '@fluentui-react-native/stack';
import { stackStyle } from '../Common/styles';
import { DROPDOWN_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const DropdownDefault: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Option>Test</Option>
      <Option disabled>Disabled Test</Option>
    </Stack>
  );
};

const menuSections: TestSection[] = [
  {
    name: 'Dropdown Default',
    testID: DROPDOWN_TESTPAGE,
    component: DropdownDefault,
  },
];

export const DropdownTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = 'TODO';

  const spec = 'TODO';

  return <Test name="Dropdown Test" description={description} spec={spec} sections={menuSections} status={status} />;
};
