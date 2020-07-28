import * as React from 'react';
import { ButtonFocusTest } from './ButtonFocusTest';
import { ButtonIconTest } from './ButtonIconTest';
import { BUTTON_TESTPAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';

const buttonSections: TestSection[] = [
  {
    name: 'Basic Button',
    testID: BUTTON_TESTPAGE,
    component: ButtonFocusTest
  },
  {
    name: 'Icon Button',
    component: ButtonIconTest
  },
];

export const ButtonTest: React.FunctionComponent<{}> = () => {
  const status: PlatformStatus = {
    winStatus: 'beta',
    iosStatus: 'experimental',
    macosStatus: 'experimental',
    androidStatus: 'experimental'
  }

  return (
    <Test name="Button Test" description="No description." sections={buttonSections} status={status}></Test>
  );
};