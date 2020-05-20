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
import {
  HOMEPAGE_BUTTON_BUTTON,
  HOMEPAGE_CALLOUT_BUTTON,
  HOMEPAGE_CHECKBOX_BUTTON,
  HOMEPAGE_FOCUSTRAPZONE_BUTTON,
  HOMEPAGE_LINK_BUTTON,
  HOMEPAGE_PERSONA_BUTTON,
  HOMEPAGE_PERSONACOIN_BUTTON,
  HOMEPAGE_PRESSABLE_BUTTON,
  HOMEPAGE_RADIOGROUP_BUTTON,
  HOMEPAGE_SEPARATOR_BUTTON,
  HOMEPAGE_SVG_BUTTON,
  HOMEPAGE_TEXT_BUTTON,
  HOMEPAGE_THEME_BUTTON
} from '../Consts';

export type TestDescription = {
  name: string;
  component: React.FunctionComponent<{}>;
  testPage: string;
};

export const allTestComponents: TestDescription[] = [
  {
    name: 'Button Test',
    component: ButtonFocusTest,
    testPage: HOMEPAGE_BUTTON_BUTTON
  },
  {
    name: 'Callout Test',
    component: CalloutTest,
    testPage: HOMEPAGE_CALLOUT_BUTTON
  },
  {
    name: 'Focus Trap Zone Test',
    component: FocusTrapTest,
    testPage: HOMEPAGE_FOCUSTRAPZONE_BUTTON
  },
  {
    name: 'Pressable Test',
    component: PressableTest,
    testPage: HOMEPAGE_PRESSABLE_BUTTON
  },
  {
    name: 'Link Test',
    component: LinkTest,
    testPage: HOMEPAGE_LINK_BUTTON
  },
  {
    name: 'Separator Test',
    component: SeparatorTest,
    testPage: HOMEPAGE_SEPARATOR_BUTTON
  },
  {
    name: 'Text Test',
    component: TextTest,
    testPage: HOMEPAGE_TEXT_BUTTON
  },
  {
    name: 'Theme Test',
    component: ThemeTest,
    testPage: HOMEPAGE_THEME_BUTTON
  },
  {
    name: 'PersonaCoin Test',
    component: PersonaCoinTest,
    testPage: HOMEPAGE_PERSONACOIN_BUTTON
  },
  {
    name: 'RadioGroup Test',
    component: RadioGroupTest,
    testPage: HOMEPAGE_RADIOGROUP_BUTTON
  },
  {
    name: 'Persona Test',
    component: PersonaTest,
    testPage: HOMEPAGE_PERSONA_BUTTON
  },
  {
    name: 'Checkbox Test',
    component: CheckboxTest,
    testPage: HOMEPAGE_CHECKBOX_BUTTON
  },
  {
    name: 'Svg Test',
    component: SvgTest,
    testPage: HOMEPAGE_SVG_BUTTON
  }
];
