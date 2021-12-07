import * as React from 'react';
import { ButtonVariantTest } from './ButtonVariantTestSection';
import { ToggleButtonTest } from './ToggleButtonTestSection';
import { EXPERIMENTAL_BUTTON_TEST_PAGE } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { ButtonIconTest } from './ButtonIconTestSection';
import { ButtonSizeTest } from './ButtonSizeTestSection';
import { ButtonShapeTest } from './ButtonShapeTestSection';
import { E2EButtonExperimentalTest } from './E2EButtonTest';

const buttonSections: TestSection[] = [
  {
    name: 'Button Variants',
    testID: EXPERIMENTAL_BUTTON_TEST_PAGE,
    component: ButtonVariantTest,
  },
  {
    name: 'Button Shape',
    component: ButtonShapeTest,
  },
  {
    name: 'Icon Button',
    component: ButtonIconTest,
  },
  {
    name: 'Toggle Button',
    component: ToggleButtonTest,
  },
  {
    name: 'Sizes',
    component: ButtonSizeTest,
  },
  {
    name: 'E2E Button Testing',
    component: E2EButtonExperimentalTest,
  },
];

export const ExperimentalButtonTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Experimental',
    androidStatus: 'Backlog',
  };

  const description =
    'Buttons are best used to enable a user to commit a change or complete steps in a task. They are typically found inside forms, dialogs, panels or pages. An example of their usage is confirming the deletion of a file in a confirmation dialog.\n\nWhen considering their place in a layout, contemplate the order in which a user will flow through the UI. As an example, in a form, the individual will need to read and interact with the form fields before submiting the form. Therefore, as a general rule, the button should be placed at the bottom of the UI container (a dialog, panel, or page) which holds the related UI elements.\n\nWhile buttons can technically be used to navigate a user to another part of the experience, this is not recommended unless that navigation is part of an action or their flow.';

  return <Test name="Experimental Button Test" description={description} sections={buttonSections} status={status} />;
};
