import * as React from 'react';
import { Platform } from 'react-native';

import { E2ECheckboxV1Test } from './E2ECheckboxV1Test';
import { CHECKBOXV1_TESTPAGE } from '../../../../E2E/src/CheckboxV1/consts';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';
import { BasicCheckbox } from './BasicCheckboxTest';
import { DesktopSpecificCheckbox } from './DesktopSpecificCheckboxTest';
import { OtherCheckbox } from './OtherCheckboxPropsTest';
import { SizeCheckbox } from './SizeCheckboxTest';
import { TokenCheckbox } from './TokenCheckboxTest';

const checkboxSections: TestSection[] = [
  {
    name: 'Basic Checkboxes',
    testID: CHECKBOXV1_TESTPAGE,
    component: BasicCheckbox,
  },
  Platform.select({
    android: null,
    ios: null,
    default: {
      name: 'Size Checkboxes',
      component: SizeCheckbox,
    },
  }),
  Platform.select({
    android: null,
    ios: null,
    default: {
      name: 'Desktop Specific Checkboxes',
      component: DesktopSpecificCheckbox,
    },
  }),
  {
    name: 'Other Implementations',
    component: OtherCheckbox,
  },
  Platform.select({
    android: null,
    ios: null,
    default: {
      name: 'Token Customized Checkboxes',
      component: TokenCheckbox,
    },
  }),
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E Testing for CheckboxV1',
    component: E2ECheckboxV1Test,
  },
];

export const CheckboxV1Test: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'N/A',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description =
    'Checkboxes give people a way to select one or more items from a group, or switch between two mutually exclusive options (checked or unchecked, on or off). For macOS, use experimental-checkbox package.';

  return <Test name="CheckboxV1 Test" description={description} sections={checkboxSections} status={status} e2eSections={e2eSections} />;
};
