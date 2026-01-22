import * as React from 'react';
import { Platform } from 'react-native';

import { BUTTON_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { ButtonShapeTest } from './ButtonShapeTestSection';
import { ButtonSizeTest } from './ButtonSizeTestSection';
import { ButtonVariantTest } from './ButtonVariantTestSection';
import { ButtonFocusTest_deprecated } from './deprecated/ButtonFocusTest';
import { ButtonIconTest_deprecated } from './deprecated/ButtonIconTest';
import { E2EButtonTest_deprecated } from './deprecated/E2EButtonTest';
import { E2EButtonTest } from './E2EButtonTest';
import { ToggleButtonTest } from './ToggleButtonTestSection';
import { ButtonHOCTest } from '../Button/ButtonHOCTestSection';
import { ButtonIconTest } from '../Button/ButtonIconTestSection';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const buttonSections: TestSection[] = [
  {
    name: 'Button Variants',
    testID: BUTTON_TESTPAGE,
    component: ButtonVariantTest,
  },
  {
    name: 'Icon Button',
    component: ButtonIconTest,
  },
  ...Platform.select({
    // The following sections are not supported for iOS or Android
    ios: [],
    android: [],
    default: [
      {
        name: 'Toggle Button',
        component: ToggleButtonTest,
      },
      {
        name: 'Button Shape',
        component: ButtonShapeTest,
      },
    ],
  }),
  {
    name: 'Sizes',
    component: ButtonSizeTest,
  },
  Platform.select({
    android: null,
    default: {
      name: 'Customize, Compose, and Ref',
      component: ButtonHOCTest,
    },
  }),
  ...Platform.select({
    android: [], // Following sections are not supported from Fluent Android
    default: [
      {
        name: 'Deprecated Basic Button',
        component: ButtonFocusTest_deprecated,
      },
      {
        name: 'Deprecated Icon Button',
        component: ButtonIconTest_deprecated,
      },
    ],
  }),
];

const e2eSections: TestSection[] = [
  {
    name: 'E2E Button Testing',
    component: E2EButtonTest,
  },
  {
    name: 'Deprecated E2E Button Testing',
    component: E2EButtonTest_deprecated,
  },
];

export const ButtonTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Backlog',
    iosStatus: 'Production',
    macosStatus: 'Production',
    androidStatus: 'Production',
  };

  const description =
    'Buttons are best used to enable a user to commit a change or complete steps in a task. They are typically found inside forms, dialogs, panels or pages. An example of their usage is confirming the deletion of a file in a confirmation dialog.\n\nWhen considering their place in a layout, contemplate the order in which a user will flow through the UI. As an example, in a form, the individual will need to read and interact with the form fields before submiting the form. Therefore, as a general rule, the button should be placed at the bottom of the UI container (a dialog, panel, or page) which holds the related UI elements.\n\nWhile buttons can technically be used to navigate a user to another part of the experience, this is not recommended unless that navigation is part of an action or their flow.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Button/SPEC.md';

  return (
    <Test name="Button Test" description={description} spec={spec} sections={buttonSections} status={status} e2eSections={e2eSections} />
  );
};
