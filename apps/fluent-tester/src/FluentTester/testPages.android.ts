import { TestDescription } from './TestComponents';
import { ButtonTest, HOMEPAGE_BUTTON_BUTTON } from './TestComponents/Button';
import { CalloutTest, HOMEPAGE_CALLOUT_BUTTON } from './TestComponents/Callout';
import { CheckboxTest, HOMEPAGE_CHECKBOX_BUTTON } from './TestComponents/Checkbox';
import { ContextualMenuTest, HOMEPAGE_CONTEXTUALMENU_BUTTON } from './TestComponents/ContextualMenu';
import { FocusTrapTest, HOMEPAGE_FOCUSTRAPZONE_BUTTON } from './TestComponents/FocusTrapZone';
import { HOMEPAGE_LINK_BUTTON, LinkTest } from './TestComponents/Link';
import { HOMEPAGE_PERSONA_BUTTON, PersonaTest } from './TestComponents/Persona';
import { HOMEPAGE_PERSONACOIN_BUTTON, PersonaCoinTest } from './TestComponents/PersonaCoin';
import { HOMEPAGE_PRESSABLE_BUTTON, PressableTest } from './TestComponents/Pressable';
import { HOMEPAGE_RADIOGROUP_BUTTON, RadioGroupTest } from './TestComponents/RadioGroup';
import { HOMEPAGE_SEPARATOR_BUTTON, SeparatorTest } from './TestComponents/Separator';
import { HOMEPAGE_SHIMMER_BUTTON, ShimmerTest } from './TestComponents/Shimmer';
import { HOMEPAGE_SVG_BUTTON, SvgTest } from './TestComponents/Svg';
import { HOMEPAGE_TEXT_BUTTON, TextTest } from './TestComponents/Text';
import { HOMEPAGE_THEME_BUTTON, ThemeTest } from './TestComponents/Theme';
import { HOMEPAGE_ICON_BUTTON, IconTest } from './TestComponents/Icon';

export const tests: TestDescription[] = [
  {
    name: 'Button Test',
    component: ButtonTest,
    testPage: HOMEPAGE_BUTTON_BUTTON,
  },
  {
    name: 'Callout Test',
    component: CalloutTest,
    testPage: HOMEPAGE_CALLOUT_BUTTON,
  },
  {
    name: 'ContextualMenu Test',
    component: ContextualMenuTest,
    testPage: HOMEPAGE_CONTEXTUALMENU_BUTTON,
  },
  {
    name: 'Focus Trap Zone Test',
    component: FocusTrapTest,
    testPage: HOMEPAGE_FOCUSTRAPZONE_BUTTON,
  },
  {
    name: 'Pressable Test',
    component: PressableTest,
    testPage: HOMEPAGE_PRESSABLE_BUTTON,
  },
  {
    name: 'Link Test',
    component: LinkTest,
    testPage: HOMEPAGE_LINK_BUTTON,
  },
  {
    name: 'Separator Test',
    component: SeparatorTest,
    testPage: HOMEPAGE_SEPARATOR_BUTTON,
  },
  {
    name: 'Shimmer Test',
    component: ShimmerTest,
    testPage: HOMEPAGE_SHIMMER_BUTTON,
  },
  {
    name: 'Text Test',
    component: TextTest,
    testPage: HOMEPAGE_TEXT_BUTTON,
  },
  {
    name: 'Theme Test',
    component: ThemeTest,
    testPage: HOMEPAGE_THEME_BUTTON,
  },
  {
    name: 'PersonaCoin Test',
    component: PersonaCoinTest,
    testPage: HOMEPAGE_PERSONACOIN_BUTTON,
  },
  {
    name: 'RadioGroup Test',
    component: RadioGroupTest,
    testPage: HOMEPAGE_RADIOGROUP_BUTTON,
  },
  {
    name: 'Persona Test',
    component: PersonaTest,
    testPage: HOMEPAGE_PERSONA_BUTTON,
  },
  {
    name: 'Checkbox Test',
    component: CheckboxTest,
    testPage: HOMEPAGE_CHECKBOX_BUTTON,
  },
  {
    name: 'Svg Test',
    component: SvgTest,
    testPage: HOMEPAGE_SVG_BUTTON,
  },
  {
    name: 'Icon Test',
    component: IconTest,
    testPage: HOMEPAGE_ICON_BUTTON,
  },
];
