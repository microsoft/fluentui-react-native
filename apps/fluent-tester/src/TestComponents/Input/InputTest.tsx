import * as React from 'react';

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

export const InputTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Experimental',
  };

  const description = 'Input allows the user to enter and edit text.';

  return <Test name="Input Test" description={description} sections={inputSections} status={status}></Test>;
};
