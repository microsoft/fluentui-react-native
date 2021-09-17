import * as React from 'react';
import { HOMEPAGE_MENU_BUTTON_EXPERIMENTAL } from './consts';
import { Test, TestSection, PlatformStatus } from '../Test';
import { StandardMenuButton } from './StandardMenuButtonTest';
import { NestedMenuButton } from './NestedMenuButtonTest';
import { CustomizedMenuButton } from './CustomizedMenuButtonTest';

const menuButtonSections: TestSection[] = [
  {
    name: 'Standard MenuButton',
    testID: HOMEPAGE_MENU_BUTTON_EXPERIMENTAL,
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

export const ExperimentalMenuButtonTest: React.FunctionComponent = () => {
  const status: PlatformStatus = {
    win32Status: 'Experimental',
    uwpStatus: 'Backlog',
    iosStatus: 'Backlog',
    macosStatus: 'Backlog',
    androidStatus: 'Backlog',
  };

  const description =
    'MenuButton is a component which contains ContextualMenu and Button components. This control combines and simplifies the API for customers.\nClicking on MenuButton opens ContextualMenu. It can have Submenu. But selection checks and a beak are not implemented.';

  return <Test name="Experimental MenuButton Test" description={description} sections={menuButtonSections} status={status} />;
};
