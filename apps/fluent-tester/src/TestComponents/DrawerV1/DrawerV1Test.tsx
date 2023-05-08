import * as React from 'react';

import { DrawerV1Default } from './DrawerV1Default';
import { E2EDrawerV1Test } from './E2EDrawerV1Test';
import { DrawerV1_TESTPAGE } from '../../../../E2E/src/DrawerV1/consts';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const DrawerV1Sections: TestSection[] = [
  {
    name: 'DrawerV1 Page',
    testID: DrawerV1_TESTPAGE,
    component: DrawerV1Default,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E DrawerV1 Testing',
    component: E2EDrawerV1Test,
  },
];

export const DrawerV1Test: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Experimental',
  };

  const description = 'DrawerV1 allows the user to enter and edit text.';

  return <Test name="DrawerV1 Test" description={description} sections={DrawerV1Sections} status={status} e2eSections={e2eSections}></Test>;
};
