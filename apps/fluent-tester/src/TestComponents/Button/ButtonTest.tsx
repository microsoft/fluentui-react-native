import * as React from 'react';
import { ButtonFocusTest_deprecated } from './deprecated/ButtonFocusTest';
import { ButtonIconTest_deprecated } from './deprecated/ButtonIconTest';
import { BUTTON_TESTPAGE } from './consts';
import { E2EButtonTest_deprecated } from './deprecated/E2EButtonTest';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ButtonVariantTest } from './ButtonVariantTestSection';
import { ToggleButtonTest } from './ToggleButtonTestSection';
import { ButtonIconTest } from '../Button/ButtonIconTestSection';
import { ButtonSizeTest } from './ButtonSizeTestSection';
import { ButtonShapeTest } from './ButtonShapeTestSection';
import { E2EButtonExperimentalTest } from './E2EButtonTest';
import { ButtonHOCTest } from '../Button/ButtonHOCTestSection';
import { Platform } from 'react-native';

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
    android: [null], //Following sections are not supported from Fluent Android
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
  {
    name: 'Customize, Compose, and Ref',
    component: ButtonHOCTest,
  },
  {
    name: 'E2E Button Testing',
    component: E2EButtonExperimentalTest,
  },
  {
    name: 'Deprecated Basic Button',
    component: ButtonFocusTest_deprecated,
  },
  {
    name: 'Deprecated Icon Button',
    component: ButtonIconTest_deprecated,
  },
  {
    name: 'Deprecated E2E Button Testing',
    component: E2EButtonTest_deprecated,
  },
];

export const ButtonTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Beta',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Beta',
    androidStatus: 'Experimental',
  };

  const description =
    'Buttons are best used to enable a user to commit a change or complete steps in a task. They are typically found inside forms, dialogs, panels or pages. An example of their usage is confirming the deletion of a file in a confirmation dialog.\n\nWhen considering their place in a layout, contemplate the order in which a user will flow through the UI. As an example, in a form, the individual will need to read and interact with the form fields before submiting the form. Therefore, as a general rule, the button should be placed at the bottom of the UI container (a dialog, panel, or page) which holds the related UI elements.\n\nWhile buttons can technically be used to navigate a user to another part of the experience, this is not recommended unless that navigation is part of an action or their flow.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Button/SPEC.md';

  return <Test name="Button Test" description={description} spec={spec} sections={buttonSections} status={status} />;
};
