import * as React from 'react';
import { DIVIDER_TESTPAGE } from './consts';
import { DividerDefault } from './DividerDefault';
import { Test, TestSection, PlatformStatus } from '../Test';

const dividerSections: TestSection[] = [
  {
    name: 'Divider Page',
    testID: DIVIDER_TESTPAGE,
    component: DividerDefault,
  },
];

export const DividerTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description = 'component-description';

  return <Test name="Divider Test" description={description} sections={dividerSections} status={status}></Test>;
};
