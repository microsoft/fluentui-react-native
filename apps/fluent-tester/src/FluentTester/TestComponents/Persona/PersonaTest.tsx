import * as React from 'react';
import { StandardUsage } from './StandardUsage';
import { CustomizeUsage } from './CustomizeUsage';
import { PERSONA_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

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

export const PersonaTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    "Personas are used for rendering an individual's avatar and presence. Persona renders a PersonaCoin along with descriptive text components.";

  return <Test name="Persona Test" description={description} sections={personaSections} status={status}></Test>;
};
