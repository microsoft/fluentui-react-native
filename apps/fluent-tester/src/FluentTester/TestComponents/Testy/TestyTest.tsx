import * as React from 'react';
import { TESTY_TESTPAGE } from './consts';
import { TestyDefault } from './TestyDefault';
import { Test, TestSection, PlatformStatus } from '../Test';

const testySections: TestSection[] = [
  {
    name: 'Testy Page',
    testID: TESTY_TESTPAGE,
    component: TestyDefault,
  },
];

export const TestyTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description = 'component-description';

  return <Test name="Testy Test" description={description} sections={testySections} status={status}></Test>;
};
