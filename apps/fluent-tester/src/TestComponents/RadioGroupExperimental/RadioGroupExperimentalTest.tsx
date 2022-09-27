import * as React from 'react';
import { RADIO_GROUP_EXPERIMENTAL_TESTPAGE } from './consts';
import { DefaultRadioGroup } from './DefaultRadioGroup';
import { E2ERadioGroupExperimentalTest } from './RadioGroupExperimentalE2ETest';
import { Test, TestSection, PlatformStatus } from '../Test';

const radioGroupExperimentalSections: TestSection[] = [
  {
    name: 'Default RadioGroup Usage',
    testID: RADIO_GROUP_EXPERIMENTAL_TESTPAGE,
    component: DefaultRadioGroup,
  },
  {
    name: 'RadioGroup for E2E Testing',
    component: E2ERadioGroupExperimentalTest,
  },
];

export const RadioGroupExperimentalTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'RadioGroup lets users select a single option from two or more choices. Each option is represented by one Radio; a user can select only one Radio in a RadioGroup.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/experimental/RadioGroup/SPEC.md';

  return (
    <Test
      name="Experimental RadioGroup Test"
      description={description}
      spec={spec}
      sections={radioGroupExperimentalSections}
      status={status}
    />
  );
};
