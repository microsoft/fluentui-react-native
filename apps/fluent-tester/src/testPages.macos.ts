import { TestDescription } from './TestComponents';
import { AvatarTest, NativeAvatarTest, HOMEPAGE_AVATAR_BUTTON, HOMEPAGE_NATIVE_AVATAR_BUTTON } from './TestComponents/Avatar';
import { BadgeTest, HOMEPAGE_BADGE_BUTTON } from './TestComponents/Badge';
import { ButtonTest, HOMEPAGE_BUTTON_BUTTON } from './TestComponents/Button';
import { CalloutTest, HOMEPAGE_CALLOUT_BUTTON } from './TestComponents/Callout';
import { CheckboxTest, HOMEPAGE_CHECKBOX_BUTTON } from './TestComponents/Checkbox';
import { ContextualMenuTest, HOMEPAGE_CONTEXTUALMENU_BUTTON } from './TestComponents/ContextualMenu';
import { ExperimentalCheckboxTest, HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON } from './TestComponents/CheckboxExperimental';
import { HOMEPAGE_FOCUSZONE_BUTTON, FocusZoneTest } from './TestComponents/FocusZone';
import { HOMEPAGE_ICON_BUTTON, IconTest } from './TestComponents/Icon';
import { HOMEPAGE_LINK_BUTTON, LinkTest } from './TestComponents/Link';
import { HOMEPAGE_PERSONA_BUTTON, PersonaTest } from './TestComponents/Persona';
import { HOMEPAGE_PERSONACOIN_BUTTON, PersonaCoinTest } from './TestComponents/PersonaCoin';
import { HOMEPAGE_PRESSABLE_BUTTON, PressableTest } from './TestComponents/Pressable';
import { HOMEPAGE_SHIMMER_BUTTON, ShimmerTest } from './TestComponents/Shimmer';
import { HOMEPAGE_RADIOGROUP_BUTTON, RadioGroupTest } from './TestComponents/RadioGroup';
import { HOMEPAGE_SEPARATOR_BUTTON, SeparatorTest } from './TestComponents/Separator';
import { HOMEPAGE_SHADOW_BUTTON, ShadowTest } from './TestComponents/Shadow';
import { HOMEPAGE_SVG_BUTTON, SvgTest } from './TestComponents/Svg';
import { HOMEPAGE_TEXT_BUTTON, TextTest } from './TestComponents/Text';
import { HOMEPAGE_THEME_BUTTON, ThemeTest } from './TestComponents/Theme';
import { HOMEPAGE_MENUBUTTON_BUTTON, MenuButtonTest } from './TestComponents/MenuButton';
import { HOMEPAGE_TOKEN_BUTTON, TokenTest } from './TestComponents/Tokens';
import { HOMEPAGE_TABS_BUTTON, TabsTest } from './TestComponents/Tabs';
import { HOMEPAGE_EXPERIMENTAL_TABS_BUTTON, ExperimentalTabsTest } from './TestComponents/TabsExperimental';
import { HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON, TextExperimentalTest } from './TestComponents/TextExperimental';
import { ExperimentalMenuButtonTest, HOMEPAGE_EXPERIMENTAL_MENU_BUTTON } from './TestComponents/MenuButtonExperimental';
import { ActivityIndicatorTest, HOMEPAGE_ACTIVITY_INDICATOR_BUTTON } from './TestComponents/ActivityIndicator';
import { HOMEPAGE_MENU_BUTTON, MenuTest } from './TestComponents/Menu';

export const tests: TestDescription[] = [
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
    name: 'NativeAvatar Test',
    component: NativeAvatarTest,
    testPage: HOMEPAGE_NATIVE_AVATAR_BUTTON,
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
    name: 'Checkbox Test',
    component: CheckboxTest,
    testPage: HOMEPAGE_CHECKBOX_BUTTON,
  },
  {
    name: 'ContextualMenu Test',
    component: ContextualMenuTest,
    testPage: HOMEPAGE_CONTEXTUALMENU_BUTTON,
  },
  {
    name: 'Experimental Checkbox',
    component: ExperimentalCheckboxTest,
    testPage: HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON,
  },
  {
    name: 'Experimental MenuButton Test',
    component: ExperimentalMenuButtonTest,
    testPage: HOMEPAGE_EXPERIMENTAL_MENU_BUTTON,
  },
  {
    name: 'Experimental Tabs Test',
    component: ExperimentalTabsTest,
    testPage: HOMEPAGE_EXPERIMENTAL_TABS_BUTTON,
  },
  {
    name: 'Experimental Text Test',
    component: TextExperimentalTest,
    testPage: HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON,
  },
  {
    name: 'FocusZone Test',
    component: FocusZoneTest,
    testPage: HOMEPAGE_FOCUSZONE_BUTTON,
  },
  {
    name: 'Icon Test',
    component: IconTest,
    testPage: HOMEPAGE_ICON_BUTTON,
  },
  {
    name: 'Link Test',
    component: LinkTest,
    testPage: HOMEPAGE_LINK_BUTTON,
  },
  {
    name: 'Menu Test',
    component: MenuTest,
    testPage: HOMEPAGE_MENU_BUTTON,
  },
  {
    name: 'MenuButton Test',
    component: MenuButtonTest,
    testPage: HOMEPAGE_MENUBUTTON_BUTTON,
  },
  {
    name: 'Persona Test',
    component: PersonaTest,
    testPage: HOMEPAGE_PERSONA_BUTTON,
  },
  {
    name: 'PersonaCoin Test',
    component: PersonaCoinTest,
    testPage: HOMEPAGE_PERSONACOIN_BUTTON,
  },
  {
    name: 'Pressable Test',
    component: PressableTest,
    testPage: HOMEPAGE_PRESSABLE_BUTTON,
  },
  {
    name: 'RadioGroup Test',
    component: RadioGroupTest,
    testPage: HOMEPAGE_RADIOGROUP_BUTTON,
  },
  {
    name: 'Separator Test',
    component: SeparatorTest,
    testPage: HOMEPAGE_SEPARATOR_BUTTON,
  },
  {
    name: 'Shadow Test',
    component: ShadowTest,
    testPage: HOMEPAGE_SHADOW_BUTTON,
  },
  {
    name: 'Shimmer Test',
    component: ShimmerTest,
    testPage: HOMEPAGE_SHIMMER_BUTTON,
  },
  {
    name: 'Svg Test',
    component: SvgTest,
    testPage: HOMEPAGE_SVG_BUTTON,
  },
  {
    name: 'Tabs Test',
    component: TabsTest,
    testPage: HOMEPAGE_TABS_BUTTON,
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
    name: 'Tokens Test',
    component: TokenTest,
    testPage: HOMEPAGE_TOKEN_BUTTON,
  },
];
