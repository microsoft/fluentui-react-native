import * as React from 'react';

import { E2EInputTest } from './E2EInputTest';
import { InputDefault } from './InputDefault';
import { INPUT_TESTPAGE } from '../../../../E2E/src/Input/consts';
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
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Experimental',
  };

  const description = 'Input allows the user to enter and edit text.';

  return <Test name="Input Test" description={description} sections={inputSections} status={status} e2eSections={e2eSections}></Test>;
};
