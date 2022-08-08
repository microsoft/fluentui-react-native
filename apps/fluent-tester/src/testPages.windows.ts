import { AvatarTest, HOMEPAGE_AVATAR_BUTTON } from './TestComponents/Avatar';
import { ButtonTest, HOMEPAGE_BUTTON_BUTTON } from './TestComponents/Button';
import { BadgeTest, HOMEPAGE_BADGE_BUTTON } from './TestComponents/Badge';
import { CalloutTest, HOMEPAGE_CALLOUT_BUTTON } from './TestComponents/Callout';
import { CheckboxTest, HOMEPAGE_CHECKBOX_BUTTON } from './TestComponents/Checkbox';
// import { HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON, ExperimentalCheckboxTest } from './TestComponents/CheckboxExperimental';
import { HOMEPAGE_LINK_BUTTON, LinkTest } from './TestComponents/Link';
import { HOMEPAGE_PERSONA_BUTTON, PersonaTest } from './TestComponents/Persona';
import { HOMEPAGE_PERSONACOIN_BUTTON, PersonaCoinTest } from './TestComponents/PersonaCoin';
import { HOMEPAGE_PRESSABLE_BUTTON, PressableTest } from './TestComponents/Pressable';
import { HOMEPAGE_SEPARATOR_BUTTON, SeparatorTest } from './TestComponents/Separator';
import { HOMEPAGE_TEXT_BUTTON, TextTest } from './TestComponents/Text';
import { HOMEPAGE_THEME_BUTTON, ThemeTest } from './TestComponents/Theme';
import { HOMEPAGE_TABS_BUTTON, TabsTest } from './TestComponents/Tabs';
import { HOMEPAGE_EXPERIMENTAL_TABS_BUTTON, ExperimentalTabsTest } from './TestComponents/TabsExperimental';
import { HOMEPAGE_TOKEN_BUTTON, TokenTest } from './TestComponents/Tokens';
import { HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON, TextExperimentalTest } from './TestComponents/TextExperimental';
import { ActivityIndicatorTest, HOMEPAGE_ACTIVITY_INDICATOR_BUTTON } from './TestComponents/ActivityIndicator';

export const tests = [
  {
    name: 'ActivityIndicator Test',
    component: ActivityIndicatorTest,
    testPage: HOMEPAGE_ACTIVITY_INDICATOR_BUTTON,
  },
  {
    name: 'Avatar Test',
    component: AvatarTest,
    testPage: HOMEPAGE_AVATAR_BUTTON,
  },
  {
    name: 'Badge Test',
    component: BadgeTest,
    testPage: HOMEPAGE_BADGE_BUTTON,
  },
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
  // GH#935: Temporarily disabling while SVGs don't work in windows
  // {
  //   name: 'Experimental Checkbox',
  //   component: ExperimentalCheckboxTest,
  //   testPage: HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON,
  // },
  {
    name: 'Tabs Test',
    component: TabsTest,
    testPage: HOMEPAGE_TABS_BUTTON,
  },
  {
    name: 'Experimental Tabs Test',
    component: ExperimentalTabsTest,
    testPage: HOMEPAGE_EXPERIMENTAL_TABS_BUTTON,
  },
  {
    name: 'Tokens Test',
    component: TokenTest,
    testPage: HOMEPAGE_TOKEN_BUTTON,
  },
  // GH##1027 Temporarily disabling while the test doesn't load
  // {
  //   name: 'Expander Test',
  //   component: ExpanderTest,
  //   testPage: HOMEPAGE_EXPANDER_BUTTON,
  // },
];
