import * as React from 'react';

import { Drawer_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { DrawerDefault } from './DrawerDefault';
import { E2EDrawerTest } from './E2EDrawerTest';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const DrawerSections: TestSection[] = [
  {
    name: 'Drawer Page',
    testID: Drawer_TESTPAGE,
    component: DrawerDefault,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E Drawer Testing',
    component: E2EDrawerTest,
  },
];

export const DrawerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Backlog',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description = 'Drawer allows to put content in a drawer that slides in from different sides of the screen.';

  return <Test name="Drawer Test" description={description} sections={DrawerSections} status={status} e2eSections={e2eSections}></Test>;
};
