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
import { HOMEPAGE_CHECKBOX_BUTTON } from './Checkbox/consts';
import { HOMEPAGE_BUTTON_BUTTON } from './Button/consts';
import { HOMEPAGE_CALLOUT_BUTTON } from './Callout/consts';
import { HOMEPAGE_FOCUSTRAPZONE_BUTTON } from './FocusTrapZone/consts';
import { HOMEPAGE_LINK_BUTTON } from './Link/consts';
import { HOMEPAGE_PERSONA_BUTTON } from './Persona/consts';
import { HOMEPAGE_PERSONACOIN_BUTTON } from './PersonaCoin/consts';
import { HOMEPAGE_PRESSABLE_BUTTON } from './Pressable/consts';
import { HOMEPAGE_RADIOGROUP_BUTTON } from './RadioGroup/consts';
import { HOMEPAGE_SEPARATOR_BUTTON } from './Separator/consts';
import { HOMEPAGE_SVG_BUTTON } from './Svg/consts';
import { HOMEPAGE_TEXT_BUTTON } from './Text/consts';
import { HOMEPAGE_THEME_BUTTON } from './Theme/consts';

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
