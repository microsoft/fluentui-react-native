import * as React from 'react';
import { RADIOGROUPV1_TESTPAGE } from '../../../../E2E/src/RadioGroupV1/consts';
import { DefaultRadioGroup } from './DefaultRadioGroup';
import { RequiredRadioGroup } from './RequiredRadioGroup';
import { DisabledRadioGroup } from './DisabledRadioGroup';
import { SubtextRadioGroup } from './SubtextRadioGroup';
import { HorizontalRadioGroup } from './HorizontalRadioGroup';
import { CustomizedRadioGroup } from './CustomizedRadioGroup';
import { RadioGroupV1E2ETest } from './RadioGroupV1E2ETest';
import { Test, TestSection, PlatformStatus } from '../Test';
import { Platform } from 'react-native';

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
  {
    name: 'RadioGroup for E2E Testing',
    testID: RADIOGROUPV1_TESTPAGE,
    component: RadioGroupV1E2ETest,
  },
];

export const RadioGroupV1Test: React.FunctionComponent = () => {
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

  return <Test name="RadioGroupV1 Test" description={description} spec={spec} sections={radioGroupV1Sections} status={status} />;
};
