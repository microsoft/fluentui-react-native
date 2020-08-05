import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { PERSONACOIN_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const personaCoinSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: PERSONACOIN_TESTPAGE,
    component: StandardUsage
  },
  {
    name: 'Customize Usage',
    component: CustomizeUsage
  }
];

export const PersonaCoinTest: React.FunctionComponent<{}> = () => {

  const status: PlatformStatus = {
    win32Status: 'beta',
    uwpStatus: 'experimental',
    iosStatus: 'experimental',
    macosStatus: 'experimental',
    androidStatus: 'backlog'
  }

  return (
    <Test name="PersonaCoin Test" description="No description." sections={personaCoinSections} status={status}></Test>
  );
};
