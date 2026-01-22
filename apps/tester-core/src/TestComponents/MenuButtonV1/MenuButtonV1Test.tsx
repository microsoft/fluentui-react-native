import * as React from 'react';

import { MENUBUTTONV1_TESTPAGE } from '@fluentui-react-native/e2e-testing';

import { CustomizedMenuButton } from './CustomizedMenuButtonTest';
import { MenuButtonV1E2ETest } from './MenuButtonV1E2ETest';
import { NestedMenuButton } from './NestedMenuButtonTest';
import { StandardMenuButton } from './StandardMenuButtonTest';
import type { TestSection, PlatformStatus } from '../Test';
import { Test } from '../Test';

const menuButtonSections: TestSection[] = [
  {
    name: 'Standard MenuButton',
    testID: MENUBUTTONV1_TESTPAGE,
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
    name: 'E2E Testing MenuButton',
    component: MenuButtonV1E2ETest,
  },
];

export const MenuButtonV1Test: React.FunctionComponent = () => {
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
    <Test name="MenuButtonV1 Test" description={description} sections={menuButtonSections} status={status} e2eSections={e2eSections} />
  );
};
