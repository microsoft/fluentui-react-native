import * as React from 'react';
import { RADIO_GROUP-EXPERIMENTAL_TESTPAGE } from './consts';
import { RadioGroupExperimentalDefault } from './RadioGroupExperimentalDefault';
import { Test, TestSection, PlatformStatus } from '../Test';

const radioGroupExperimentalSections: TestSection[] = [
  {
    name: 'RadioGroupExperimental Page',
    testID: RADIO_GROUP-EXPERIMENTAL_TESTPAGE,
    component: RadioGroupExperimentalDefault,
  },
];

export const RadioGroupExperimentalTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description = 'component-description';

  return <Test name="RadioGroupExperimental Test" description={description} sections={radioGroupExperimentalSections} status={status}></Test>;
};
