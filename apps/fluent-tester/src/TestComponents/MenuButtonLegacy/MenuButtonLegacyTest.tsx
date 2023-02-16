import * as React from 'react';

import { CustomizedMenuButton } from './CustomizedMenuButtonTest';
import { MenuButtonLegacyE2ETest } from './MenuButtonLegacyE2ETest';
import { NestedMenuButton } from './NestedMenuButtonTest';
import { StandardMenuButton } from './StandardMenuButtonTest';
import { MENU_BUTTON_TESTPAGE } from '../../../../E2E/src/MenuButtonLegacy/consts';
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
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'MenuButton is a component which contains ContextualMenu and Button components. This control combines and simplifies the API for customers.\nClicking on MenuButton opens ContextualMenu. It can have Submenu. But selection checks and a beak are not implemented.';

  return (
    <Test name="MenuButton Legacy Test" description={description} sections={menuButtonSections} status={status} e2eSections={e2eSections} />
  );
};
