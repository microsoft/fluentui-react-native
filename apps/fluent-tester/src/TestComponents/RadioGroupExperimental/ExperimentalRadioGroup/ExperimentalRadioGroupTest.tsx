import * as React from 'react';
import { EXPERIMENTAL_RADIO-GROUP_TESTPAGE } from './consts';
import { ExperimentalRadioGroupDefault } from './ExperimentalRadioGroupDefault';
import { Test, TestSection, PlatformStatus } from '../Test';

const experimentalRadioGroupSections: TestSection[] = [
  {
    name: 'ExperimentalRadioGroup Page',
    testID: EXPERIMENTAL_RADIO-GROUP_TESTPAGE,
    component: ExperimentalRadioGroupDefault,
  },
];

export const ExperimentalRadioGroupTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Backlog',
  };

  const description = 'component-description';

  return <Test name="ExperimentalRadioGroup Test" description={description} sections={experimentalRadioGroupSections} status={status}></Test>;
};
