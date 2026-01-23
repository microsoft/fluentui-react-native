import * as React from 'react';

import { MENU_BUTTON_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { CustomizedMenuButton } from './CustomizedMenuButtonTest';
import { MenuButtonLegacyE2ETest } from './MenuButtonLegacyE2ETest';
import { NestedMenuButton } from './NestedMenuButtonTest';
import { StandardMenuButton } from './StandardMenuButtonTest';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const menuButtonSections: TestSection[] = [
  {
    name: 'Standard MenuButton',
    testID: MENU_BUTTON_TESTPAGE,
    component: StandardMenuButton,
  },
  {
    name: 'Nested MenuButton',
    component: NestedMenuButton,
  },
  {
    name: 'MenuButton with customized UI',
    component: CustomizedMenuButton,
  },
];

const e2eSections: TestSection[] = [
  {
    name: 'MenuButton for E2E Testing',
    component: MenuButtonLegacyE2ETest,
  },
];

export const MenuButtonLegacyTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Deprecated',
    uwpStatus: 'Deprecated',
    iosStatus: 'Deprecated',
    macosStatus: 'Deprecated',
    androidStatus: 'Deprecated',
  };

  const description =
    'MenuButton is a component which contains ContextualMenu and Button components. This control combines and simplifies the API for customers.\nClicking on MenuButton opens ContextualMenu. It can have Submenu. But selection checks and a beak are not implemented.';

  return (
    <Test name="MenuButton Legacy Test" description={description} sections={menuButtonSections} status={status} e2eSections={e2eSections} />
  );
};
