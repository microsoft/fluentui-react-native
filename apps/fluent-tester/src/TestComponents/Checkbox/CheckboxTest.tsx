import * as React from 'react';
import { CHECKBOX_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { E2ECheckboxV1Test } from './E2ECheckboxExperimentalTest';
import { BasicCheckbox_legacy, OtherCheckbox_legacy, TokenCheckbox_legacy } from './legacy/CheckboxTest';
import { E2ECheckboxTest_legacy } from './legacy/CheckboxE2ETest';
import { BasicCheckbox } from './BasicCheckbox';
import { SizeCheckbox } from './SizeCheckbox';
import { OtherCheckbox } from './OtherCheckbox';
import { TokenCheckbox } from './TokenCheckbox';

const checkboxSections: TestSection[] = [
  {
    name: 'Basic Checkboxes',
    testID: CHECKBOX_TESTPAGE,
    component: BasicCheckbox,
  },
  {
    name: 'Size Checkboxes',
    component: SizeCheckbox,
  },
  {
    name: 'Other Implementations',
    component: OtherCheckbox,
  },
  {
    name: 'Token Customized Checkboxes',
    component: TokenCheckbox,
  },
  {
    name: 'E2E Testing for CheckboxV1',
    component: E2ECheckboxV1Test,
  },
  {
    name: 'Legacy - Basic Checkboxes',
    component: BasicCheckbox_legacy,
  },
  {
    name: 'Legacy - Other Implementations',
    component: OtherCheckbox_legacy,
  },
  {
    name: 'Legacy - Token Customized Checkboxes',
    component: TokenCheckbox_legacy,
  },
  {
    name: 'Legacy - Checkbox for E2E Testing',
    component: E2ECheckboxTest_legacy,
  },
];

export const CheckboxTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'N/A',
    macosStatus: 'Experimental',
    androidStatus: 'Experimental',
  };

  const description =
    'Checkboxes give people a way to select one or more items from a group, or switch between two mutually exclusive options (checked or unchecked, on or off).';

  return <Test name="Checkbox Test" description={description} sections={checkboxSections} status={status} />;
};
