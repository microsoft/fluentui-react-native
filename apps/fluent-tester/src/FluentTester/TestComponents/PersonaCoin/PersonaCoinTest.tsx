import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { PERSONACOIN_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const personaCoinSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: PERSONACOIN_TESTPAGE,
    component: StandardUsage,
  },
  {
    name: 'Customize Usage',
    component: CustomizeUsage,
  },
];

export const PersonaCoinTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = "PersonaCoins are used for rendering an individual's avatar. PersonaCoin renders the circular image component.";

  return <Test name="PersonaCoin Test" description={description} sections={personaCoinSections} status={status} />;
};
