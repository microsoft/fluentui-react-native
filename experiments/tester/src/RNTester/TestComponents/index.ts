import * as React from 'react';
import { ButtonFocusTest } from './ButtonFocusTest';
import { PressableTest } from './PressableTest';
import { LinkTest } from './LinkTest.win32';
import { SeparatorTest } from './SeparatorTest';
import { ThemeTest } from './ThemeTest';
import { FocusTrapTest } from './FocusTrapZoneTest';
import { PersonaCoinTest } from './PersonaCoin/PersonaCoinTest';

export type TestDescription = {
  name: string;
  component: React.FunctionComponent<{}>;
};

export const allTestComponents: TestDescription[] = [
  {
    name: 'Button Test',
    component: ButtonFocusTest
  },
  {
    name: 'Focus Trap Zone Test',
    component: FocusTrapTest
  },
  {
    name: 'Pressable Test',
    component: PressableTest
  },
  {
    name: 'Link Test',
    component: LinkTest
  },
  {
    name: 'Separator Test',
    component: SeparatorTest
  },
  {
    name: 'Theme Test',
    component: ThemeTest
  },
  {
    name: 'PersonaCoin Test',
    component: PersonaCoinTest
  }
];
