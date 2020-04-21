import * as React from 'react';
import { ButtonFocusTest } from './Button';
import { CalloutTest } from './Callout';
import { CheckboxTest } from './Checkbox';
import { FocusTrapTest } from './FocusTrapZone';
import { LinkTest } from './Link';
import { PersonaTest } from './Persona';
import { PersonaCoinTest } from './PersonaCoin';
import { PressableTest } from './Pressable';
import { RadioGroupTest } from './RadioGroup';
import { SeparatorTest } from './Separator';
import { SvgTest } from './Svg';
import { TextTest } from './Text';
import { ThemeTest } from './Theme';

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
    name: 'Callout Test',
    component: CalloutTest
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
    name: 'Text Test',
    component: TextTest
  },
  {
    name: 'Theme Test',
    component: ThemeTest
  },
  {
    name: 'PersonaCoin Test',
    component: PersonaCoinTest
  },
  {
    name: 'RadioGroup Test',
    component: RadioGroupTest
  },
  {
    name: 'Persona Test',
    component: PersonaTest
  },
  {
    name: 'Checkbox Test',
    component: CheckboxTest
  },
  {
    name: 'Svg Test',
    component: SvgTest
  }
];
