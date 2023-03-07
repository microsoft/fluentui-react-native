import * as React from 'react';

import { CustomizeUsage } from './CustomizeUsage';
import { StandardUsage } from './StandardUsage';
import { PERSONA_TESTPAGE } from '../../../../E2E/src/Persona/consts';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const personaSections: TestSection[] = [
  {
    name: 'Standard Usage',
    testID: PERSONA_TESTPAGE,
    component: StandardUsage,
  },
  {
    name: 'Customize Usage',
    component: CustomizeUsage,
  },
];

export const PersonaTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Deprecated',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    "Personas are used for rendering an individual's avatar and presence. Persona renders a PersonaCoin along with descriptive text components.";

  return <Test name="Persona Test" description={description} sections={personaSections} status={status} />;
};
