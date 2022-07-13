import { TestDescription } from './TestComponents';
import { AvatarTest, NativeAvatarTest, HOMEPAGE_AVATAR_BUTTON, HOMEPAGE_NATIVE_AVATAR_BUTTON } from './TestComponents/Avatar';
import { BadgeTest, HOMEPAGE_BADGE } from './TestComponents/Badge';
import { ButtonTest, HOMEPAGE_BUTTON_BUTTON } from './TestComponents/Button';
import { CheckboxTest, HOMEPAGE_CHECKBOX_BUTTON } from './TestComponents/Checkbox';
import { ExperimentalCheckboxTest, HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON } from './TestComponents/CheckboxExperimental';
import { HOMEPAGE_ICON_BUTTON, IconTest } from './TestComponents/Icon';
import { HOMEPAGE_LINK_BUTTON, LinkTest } from './TestComponents/Link';
import { NativeDatePickerTest, HOMEPAGE_NATIVEDATEPICKER_BUTTON } from './TestComponents/NativeDatePicker';
import { HOMEPAGE_PERSONA_BUTTON, PersonaTest } from './TestComponents/Persona';
import { HOMEPAGE_PERSONACOIN_BUTTON, PersonaCoinTest } from './TestComponents/PersonaCoin';
import { HOMEPAGE_PRESSABLE_BUTTON, PressableTest } from './TestComponents/Pressable';
import { HOMEPAGE_RADIOGROUP_BUTTON, RadioGroupTest } from './TestComponents/RadioGroup';
import { HOMEPAGE_SEPARATOR_BUTTON, SeparatorTest } from './TestComponents/Separator';
import { HOMEPAGE_SHADOW_BUTTON, ShadowTest } from './TestComponents/Shadow';
import { HOMEPAGE_SHIMMER_BUTTON, ShimmerTest } from './TestComponents/Shimmer';
import { HOMEPAGE_SVG_BUTTON, SvgTest } from './TestComponents/Svg';
import { HOMEPAGE_TEXT_BUTTON, TextTest } from './TestComponents/Text';
import { HOMEPAGE_THEME_BUTTON, ThemeTest } from './TestComponents/Theme';
import { ActivityIndicatorTest, HOMEPAGE_ACTIVITY_INDICATOR_BUTTON } from './TestComponents/ActivityIndicator';
import { HOMEPAGE_TOKEN_BUTTON, TokenTest } from './TestComponents/Tokens';
import { HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON, TextExperimentalTest } from './TestComponents/TextExperimental';
import { HOMEPAGE_NOTIFICATION_BUTTON, NotificationTest } from './TestComponents/Notification';

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
    testPage: HOMEPAGE_BADGE,
  },
  {
    name: 'Button Test',
    component: ButtonTest,
    testPage: HOMEPAGE_BUTTON_BUTTON,
  },
  {
    name: 'Native Date Picker',
    component: NativeDatePickerTest,
    testPage: HOMEPAGE_NATIVEDATEPICKER_BUTTON,
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
    name: 'Experimental Text Test',
    component: TextExperimentalTest,
    testPage: HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON,
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
    name: 'Experimental Checkbox',
    component: ExperimentalCheckboxTest,
    testPage: HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON,
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
  {
    name: 'Tokens Test',
    component: TokenTest,
    testPage: HOMEPAGE_TOKEN_BUTTON,
  },
  {
    name: 'Notification Test',
    component: NotificationTest,
    testPage: HOMEPAGE_NOTIFICATION_BUTTON,
  },
  {
    name: 'Shadow Test',
    component: ShadowTest,
    testPage: HOMEPAGE_SHADOW_BUTTON,
  },
];
