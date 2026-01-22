import * as React from 'react';
import { Platform } from 'react-native';

import { RADIOGROUPV1_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { CustomizedRadioGroup } from './CustomizedRadioGroup';
import { DefaultRadioGroup } from './DefaultRadioGroup';
import { DisabledRadioGroup } from './DisabledRadioGroup';
import { HorizontalRadioGroup } from './HorizontalRadioGroup';
import { RadioGroupV1E2ETest } from './RadioGroupV1E2ETest';
import { RequiredRadioGroup } from './RequiredRadioGroup';
import { SubtextRadioGroup } from './SubtextRadioGroup';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const radioGroupV1Sections: TestSection[] = [
  {
    name: 'Default RadioGroup Usage',
    testID: RADIOGROUPV1_TESTPAGE,
    component: DefaultRadioGroup,
  },
  {
    name: 'Disabled RadioGroup',
    testID: RADIOGROUPV1_TESTPAGE,
    component: DisabledRadioGroup,
  },
  {
    name: 'Required RadioGroup',
    testID: RADIOGROUPV1_TESTPAGE,
    component: RequiredRadioGroup,
  },
  ...Platform.select({
    android: [null],
    ios: [null],
    native: [
      {
        name: 'RadioGroup with Label Subtext',
        testID: RADIOGROUPV1_TESTPAGE,
        component: SubtextRadioGroup,
      },
    ],
    default: [
      {
        name: 'RadioGroup with Label Subtext',
        testID: RADIOGROUPV1_TESTPAGE,
        component: SubtextRadioGroup,
      },
      {
        name: 'Other Layouts',
        testID: RADIOGROUPV1_TESTPAGE,
        component: HorizontalRadioGroup,
      },
      {
        name: 'Customized RadioGroup Usage',
        testID: RADIOGROUPV1_TESTPAGE,
        component: CustomizedRadioGroup,
      },
    ],
  }),
];

const e2eSections: TestSection[] = [
  {
    name: 'RadioGroup for E2E Testing',
    testID: RADIOGROUPV1_TESTPAGE,
    component: RadioGroupV1E2ETest,
  },
];

export const RadioGroupV1Test: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description =
    'RadioGroup lets users select a single option from two or more choices. Each option is represented by one Radio; a user can select only one Radio in a RadioGroup.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/experimental/RadioGroup/SPEC.md';

  return (
    <Test
      name="RadioGroupV1 Test"
      description={description}
      spec={spec}
      sections={radioGroupV1Sections}
      status={status}
      e2eSections={e2eSections}
    />
  );
};
