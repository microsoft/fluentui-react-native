import * as React from 'react';

import { PERSONACOIN_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { CustomizeUsage } from './CustomizeUsage';
import { StandardUsage } from './StandardUsage';
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
    uwpStatus: 'Deprecated',
    iosStatus: 'Deprecated',
    macosStatus: 'Deprecated',
    androidStatus: 'Deprecated',
  };

  const description = "PersonaCoins are used for rendering an individual's avatar. PersonaCoin renders the circular image component.";

  return <Test name="PersonaCoin Test" description={description} sections={personaCoinSections} status={status} />;
};
