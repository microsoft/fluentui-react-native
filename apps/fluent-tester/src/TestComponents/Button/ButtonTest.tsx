import * as React from 'react';
import { Platform } from 'react-native';

import { ButtonShapeTest } from './ButtonShapeTestSection';
import { ButtonSizeTest } from './ButtonSizeTestSection';
import { ButtonVariantTest } from './ButtonVariantTestSection';
import { ButtonFocusTest_deprecated } from './deprecated/ButtonFocusTest';
import { ButtonIconTest_deprecated } from './deprecated/ButtonIconTest';
import { E2EButtonTest_deprecated } from './deprecated/E2EButtonTest';
import { E2EButtonTest } from './E2EButtonTest';
import { ToggleButtonTest } from './ToggleButtonTestSection';
import { BUTTON_TESTPAGE } from '../../../../E2E/src/ButtonLegacy/consts';
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
];

export const ButtonTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Production',
    uwpStatus: 'Experimental',
    iosStatus: 'Experimental',
    macosStatus: 'Production',
    androidStatus: 'Experimental',
  };

  const description =
    'Buttons are best used to enable a user to commit a change or complete steps in a task. They are typically found inside forms, dialogs, panels or pages. An example of their usage is confirming the deletion of a file in a confirmation dialog.\n\nWhen considering their place in a layout, contemplate the order in which a user will flow through the UI. As an example, in a form, the individual will need to read and interact with the form fields before submiting the form. Therefore, as a general rule, the button should be placed at the bottom of the UI container (a dialog, panel, or page) which holds the related UI elements.\n\nWhile buttons can technically be used to navigate a user to another part of the experience, this is not recommended unless that navigation is part of an action or their flow.';

  const spec = 'https://github.com/microsoft/fluentui-react-native/blob/main/packages/components/Button/SPEC.md';

  return <Test name="Button Test" description={description} spec={spec} sections={buttonSections} status={status} />;
};
