import { ButtonTest, HOMEPAGE_BUTTON_BUTTON } from './TestComponents/Button';
import { CalloutTest, HOMEPAGE_CALLOUT_BUTTON } from './TestComponents/Callout';
import { CheckboxTest, HOMEPAGE_CHECKBOX_BUTTON } from './TestComponents/Checkbox';
import { HOMEPAGE_CHECKBOX_CHECKBOXEXPERIMENTAL, ExperimentalCheckboxTest } from './TestComponents/CheckboxExperimental';
import { HOMEPAGE_LINK_BUTTON, LinkTest } from './TestComponents/Link';
import { HOMEPAGE_PERSONA_BUTTON, PersonaTest } from './TestComponents/Persona';
import { HOMEPAGE_PERSONACOIN_BUTTON, PersonaCoinTest } from './TestComponents/PersonaCoin';
import { HOMEPAGE_PRESSABLE_BUTTON, PressableTest } from './TestComponents/Pressable';
import { HOMEPAGE_SEPARATOR_BUTTON, SeparatorTest } from './TestComponents/Separator';
import { HOMEPAGE_TEXT_BUTTON, TextTest } from './TestComponents/Text';
import { HOMEPAGE_THEME_BUTTON, ThemeTest } from './TestComponents/Theme';
import { HOMEPAGE_TABS_BUTTON, TabsTest } from './TestComponents/Tabs';
import { HOMEPAGE_EXPERIMENTAL_TABS_BUTTON, TabsExperimentalTest } from './TestComponents/TabsExperimental';
import { HOMEPAGE_TOKEN_BUTTON, TokenTest } from './TestComponents/Tokens';
import { ExpanderTest, HOMEPAGE_EXPANDER_BUTTON } from './TestComponents/Expander';
import { HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON, TextExperimentalTest } from './TestComponents/TextExperimental';
import { ExperimentalButtonTest, HOMEPAGE_BUTTON_BUTTONEXPERIMENTAL } from './TestComponents/ButtonExperimental';

export const tests = [
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
    name: 'Experimental Button',
    component: ExperimentalButtonTest,
    testPage: HOMEPAGE_BUTTON_BUTTONEXPERIMENTAL,
  },
  {
    name: 'Pressable Test',
    component: PressableTest,
    testPage: HOMEPAGE_PRESSABLE_BUTTON,
  },
  { name: 'Link Test', component: LinkTest, testPage: HOMEPAGE_LINK_BUTTON },
  {
    name: 'Separator Test',
    component: SeparatorTest,
    testPage: HOMEPAGE_SEPARATOR_BUTTON,
  },
  { name: 'Text Test', component: TextTest, testPage: HOMEPAGE_TEXT_BUTTON },
  {
    name: 'Experimental Text Test',
    component: TextExperimentalTest,
    testPage: HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON,
  },
  { name: 'Theme Test', component: ThemeTest, testPage: HOMEPAGE_THEME_BUTTON },
  {
    name: 'PersonaCoin Test',
    component: PersonaCoinTest,
    testPage: HOMEPAGE_PERSONACOIN_BUTTON,
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
    name: 'Experimental Checkbox',
    component: ExperimentalCheckboxTest,
    testPage: HOMEPAGE_CHECKBOX_CHECKBOXEXPERIMENTAL,
  },
  {
    name: 'Tabs Test',
    component: TabsTest,
    testPage: HOMEPAGE_TABS_BUTTON,
  },
  {
    name: 'Tabs Experimental Test',
    component: TabsExperimentalTest,
    testPage: HOMEPAGE_EXPERIMENTAL_TABS_BUTTON,
  },
  {
    name: 'Tokens Test',
    component: TokenTest,
    testPage: HOMEPAGE_TOKEN_BUTTON,
  },
  {
    name: 'Expander Test',
    component: ExpanderTest,
    testPage: HOMEPAGE_EXPANDER_BUTTON,
  },
];
