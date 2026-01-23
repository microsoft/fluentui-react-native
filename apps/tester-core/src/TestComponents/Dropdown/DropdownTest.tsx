import * as React from 'react';

import { Option, Dropdown } from '@fluentui-react-native/dropdown';
import { Stack } from '@fluentui-react-native/stack';

import { DROPDOWN_TESTPAGE } from './consts';
import { stackStyle } from '../Common/styles';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const DropdownDefault: React.FunctionComponent = () => {
  return (
    <Stack style={stackStyle}>
      <Dropdown>
        <Option>Test</Option>
        <Option disabled>Disabled Test</Option>
      </Dropdown>
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
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'TODO';

  const spec = 'TODO';

  return <Test name="Dropdown Test" description={description} spec={spec} sections={menuSections} status={status} />;
};
