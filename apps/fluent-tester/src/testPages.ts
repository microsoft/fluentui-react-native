import { TestDescription } from './TestComponents';
import { ActivityIndicatorTest } from './TestComponents/ActivityIndicator';
import { AvatarTest, NativeAvatarTest } from './TestComponents/Avatar';
import { BadgeTest } from './TestComponents/Badge';
import { ButtonTest } from './TestComponents/Button';
import { CalloutTest } from './TestComponents/Callout';
import { CheckboxTest } from './TestComponents/Checkbox';
import { CornerRadiusTokensTest } from './TestComponents/CornerRadius';
import { ExperimentalCheckboxTest } from './TestComponents/CheckboxExperimental';
import { ContextualMenuTest } from './TestComponents/ContextualMenu';
import { NativeDatePickerTest, HOMEPAGE_NATIVEDATEPICKER_BUTTON } from './TestComponents/NativeDatePicker';
import { DropdownTest, HOMEPAGE_DROPDOWN_BUTTON } from './TestComponents/Dropdown';
// import { DrawerTest, Constants.HOMEPAGE_DRAWER_BUTTON } from './TestComponents/Drawer';
// import { ExpanderTest, Constants.HOMEPAGE_EXPANDER_BUTTON } from './TestComponents/Expander';
import { FocusTrapTest } from './TestComponents/FocusTrapZone';
import { FocusZoneTest } from './TestComponents/FocusZone';
import { IconTest } from './TestComponents/Icon';
import { LinkTest } from './TestComponents/Link';
import { MenuTest } from './TestComponents/Menu';
import { MenuButtonTest } from './TestComponents/MenuButton';
import { ExperimentalMenuButtonTest } from './TestComponents/MenuButtonExperimental';
import { NotificationTest, HOMEPAGE_NOTIFICATION_BUTTON } from './TestComponents/Notification';
import { PersonaTest } from './TestComponents/Persona';
import { PersonaCoinTest } from './TestComponents/PersonaCoin';
import { PressableTest } from './TestComponents/Pressable';
import { RadioGroupTest } from './TestComponents/RadioGroup';
import { RadioGroupExperimentalTest } from './TestComponents/RadioGroupExperimental';
import { SeparatorTest } from './TestComponents/Separator';
import { ShadowTest } from './TestComponents/Shadow';
import { ShimmerTest } from './TestComponents/Shimmer';
import { SpacingTokensTest } from './TestComponents/Spacing';
import { StrokeWidthTest } from './TestComponents/StrokeWidth';
import { SvgTest } from './TestComponents/Svg';
import { SwitchTest } from './TestComponents/Switch';
import { TabsTest } from './TestComponents/Tabs';
import { ExperimentalTabsTest } from './TestComponents/TabsExperimental';
import { TextTest } from './TestComponents/Text';
import { TextExperimentalTest } from './TestComponents/TextExperimental';
import { ThemeTest } from './TestComponents/Theme';
import { TokenTest } from './TestComponents/Tokens';
import { ExperimentalLinkTest } from './TestComponents/LinkExperimental';
import * as Constants from '../../E2E/src/index.consts';

export const tests: TestDescription[] = [
  {
    name: 'ActivityIndicator',
    component: ActivityIndicatorTest,
    testPageButton: Constants.HOMEPAGE_ACTIVITY_INDICATOR_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Avatar',
    component: AvatarTest,
    testPageButton: Constants.HOMEPAGE_AVATAR_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Avatar (Native)',
    component: NativeAvatarTest,
    testPageButton: Constants.HOMEPAGE_NATIVE_AVATAR_BUTTON,
    platforms: ['ios', 'macos'],
  },
  {
    name: 'Badge',
    component: BadgeTest,
    testPageButton: Constants.HOMEPAGE_BADGE_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Button',
    component: ButtonTest,
    testPageButton: Constants.HOMEPAGE_BUTTON_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Callout',
    component: CalloutTest,
    testPageButton: Constants.HOMEPAGE_CALLOUT_BUTTON,
    platforms: ['android', 'macos', 'win32'],
  },
  {
    name: 'Checkbox Legacy',
    component: CheckboxTest,
    testPageButton: Constants.HOMEPAGE_CHECKBOX_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Checkbox V1',
    component: ExperimentalCheckboxTest,
    testPageButton: Constants.HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'], // 'windows': GH#935: Temporarily disabling while SVGs don't work in windows
  },
  {
    name: 'ContextualMenu',
    component: ContextualMenuTest,
    testPageButton: Constants.HOMEPAGE_CONTEXTUALMENU_BUTTON,
    platforms: ['android', 'macos', 'win32'],
  },
  {
    name: 'Corner Radius Tokens',
    component: CornerRadiusTokensTest,
    testPageButton: Constants.HOMEPAGE_CORNERRADIUS_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Date Picker (Native)',
    component: NativeDatePickerTest,
    testPageButton: HOMEPAGE_NATIVEDATEPICKER_BUTTON,
    platforms: ['ios'],
  },
  {
    name: 'Dropdown',
    component: DropdownTest,
    testPageButton: HOMEPAGE_DROPDOWN_BUTTON,
    platforms: ['macos', 'win32'],
  },
  // {
  //   name: 'Drawer',
  //   component: DrawerTest,
  //   testPage: Constants.HOMEPAGE_DRAWER_BUTTON,
  //   platforms: ['android'],
  // },
  // GH##1027 Temporarily disabling while the test doesn't load
  // {
  //   name: 'Expander',
  //   component: ExpanderTest,
  //   testPage: Constants.HOMEPAGE_EXPANDER_BUTTON,
  //   platforms: ['windows'],
  // },
  {
    name: 'Focus Trap Zone',
    component: FocusTrapTest,
    testPageButton: Constants.HOMEPAGE_FOCUSTRAPZONE_BUTTON,
    platforms: ['android', 'win32'],
  },
  {
    name: 'FocusZone',
    component: FocusZoneTest,
    testPageButton: Constants.HOMEPAGE_FOCUSZONE_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'Icon',
    component: IconTest,
    testPageButton: Constants.HOMEPAGE_ICON_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'],
  },
  {
    name: 'Link Legacy',
    component: LinkTest,
    testPageButton: Constants.HOMEPAGE_LINK_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Link V1',
    component: ExperimentalLinkTest,
    testPageButton: Constants.HOMEPAGE_EXPERIMENTAL_LINK_BUTTON,
    platforms: ['win32', 'android'],
  },
  {
    name: 'Menu',
    component: MenuTest,
    testPageButton: Constants.HOMEPAGE_MENU_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'MenuButton Legacy',
    component: MenuButtonTest,
    testPageButton: Constants.HOMEPAGE_MENUBUTTON_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'MenuButton V1',
    component: ExperimentalMenuButtonTest,
    testPageButton: Constants.HOMEPAGE_EXPERIMENTAL_MENU_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'Notification',
    component: NotificationTest,
    testPageButton: HOMEPAGE_NOTIFICATION_BUTTON,
    platforms: ['android', 'ios'],
  },
  {
    name: 'Persona',
    component: PersonaTest,
    testPageButton: Constants.HOMEPAGE_PERSONA_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'PersonaCoin',
    component: PersonaCoinTest,
    testPageButton: Constants.HOMEPAGE_PERSONACOIN_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Pressable',
    component: PressableTest,
    testPageButton: Constants.HOMEPAGE_PRESSABLE_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'RadioGroup Legacy',
    component: RadioGroupTest,
    testPageButton: Constants.HOMEPAGE_RADIOGROUP_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'RadioGroup V1',
    component: RadioGroupExperimentalTest,
    testPageButton: Constants.HOMEPAGE_RADIO_GROUP_EXPERIMENTAL_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'Separator',
    component: SeparatorTest,
    testPageButton: Constants.HOMEPAGE_SEPARATOR_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Shadow',
    component: ShadowTest,
    testPageButton: Constants.HOMEPAGE_SHADOW_BUTTON,
    platforms: ['ios', 'macos', 'win32'],
  },
  {
    name: 'Shimmer',
    component: ShimmerTest,
    testPageButton: Constants.HOMEPAGE_SHIMMER_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'],
  },
  {
    name: 'Spacing Tokens',
    component: SpacingTokensTest,
    testPageButton: Constants.HOMEPAGE_SPACING_BUTTON,
    platforms: ['ios'],
  },
  {
    name: 'Stroke Width Tokens',
    component: StrokeWidthTest,
    testPageButton: Constants.HOMEPAGE_STROKEWIDTH_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Svg',
    component: SvgTest,
    testPageButton: Constants.HOMEPAGE_SVG_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'],
  },
  {
    name: 'Switch',
    component: SwitchTest,
    testPageButton: Constants.HOMEPAGE_SWITCH_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Tabs Legacy',
    component: TabsTest,
    testPageButton: Constants.HOMEPAGE_TABS_BUTTON,
    platforms: ['macos', 'win32', 'windows'],
  },
  {
    name: 'Tabs V1',
    component: ExperimentalTabsTest,
    testPageButton: Constants.HOMEPAGE_EXPERIMENTAL_TABS_BUTTON,
    platforms: ['macos', 'win32', 'windows'],
  },
  {
    name: 'Text Legacy',
    component: TextTest,
    testPageButton: Constants.HOMEPAGE_TEXT_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Text V1',
    component: TextExperimentalTest,
    testPageButton: Constants.HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Theme',
    component: ThemeTest,
    testPageButton: Constants.HOMEPAGE_THEME_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Tokens',
    component: TokenTest,
    testPageButton: Constants.HOMEPAGE_TOKEN_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
];
