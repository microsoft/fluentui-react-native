import * as React from 'react';

import { INPUT_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { E2EInputTest } from './E2EInputTest';
import { InputDefault } from './InputDefault';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const inputSections: TestSection[] = [
  {
    name: 'Input Page',
    testID: INPUT_TESTPAGE,
    component: InputDefault,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E Input Testing',
    component: E2EInputTest,
  },
];

export const InputTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Backlog',
    androidStatus: 'Production',
  };

  const description = 'Input allows the user to enter and edit text.';

  return <Test name="Input Test" description={description} sections={inputSections} status={status} e2eSections={e2eSections}></Test>;
};
