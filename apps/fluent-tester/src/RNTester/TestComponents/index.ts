import * as React from 'react';
import { AvatarTest, HOMEPAGE_AVATAR_BUTTON } from './Avatar';
import { ButtonFocusTest, HOMEPAGE_BUTTON_BUTTON } from './Button';
import { CalloutTest, HOMEPAGE_CALLOUT_BUTTON } from './Callout';
import { CheckboxTest, HOMEPAGE_CHECKBOX_BUTTON } from './Checkbox';
import { FocusTrapTest, HOMEPAGE_FOCUSTRAPZONE_BUTTON } from './FocusTrapZone';
import { LinkTest, HOMEPAGE_LINK_BUTTON } from './Link';
import { PersonaTest, HOMEPAGE_PERSONA_BUTTON } from './Persona';
import { PersonaCoinTest, HOMEPAGE_PERSONACOIN_BUTTON } from './PersonaCoin';
import { PressableTest, HOMEPAGE_PRESSABLE_BUTTON } from './Pressable';
import { RadioGroupTest, HOMEPAGE_RADIOGROUP_BUTTON } from './RadioGroup';
import { SeparatorTest, HOMEPAGE_SEPARATOR_BUTTON } from './Separator';
import { SvgTest, HOMEPAGE_SVG_BUTTON } from './Svg';
import { TextTest, HOMEPAGE_TEXT_BUTTON } from './Text';
import { ThemeTest, HOMEPAGE_THEME_BUTTON } from './Theme';

export type TestDescription = {
  name: string;
  component: React.FunctionComponent<{}>;
  testPage: string;
};

export const allTestComponents: TestDescription[] = [
  {
    name: 'Avatar Test',
    component: AvatarTest,
    testPage: HOMEPAGE_AVATAR_BUTTON
  },
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
