import * as React from 'react';

import { CustomizeUsage } from './CustomizeUsage';
import { StandardUsage } from './StandardUsage';
import { PERSONACOIN_TESTPAGE } from '../../../../E2E/src/PersonaCoin/consts';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

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
    win32Status: 'Deprecated',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description = "PersonaCoins are used for rendering an individual's avatar. PersonaCoin renders the circular image component.";

  return <Test name="PersonaCoin Test" description={description} sections={personaCoinSections} status={status} />;
};
