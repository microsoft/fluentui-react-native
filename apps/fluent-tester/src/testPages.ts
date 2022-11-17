import { TestDescription } from './TestComponents';
import { ActivityIndicatorTest, HOMEPAGE_ACTIVITY_INDICATOR_BUTTON } from './TestComponents/ActivityIndicator';
import { AvatarTest, NativeAvatarTest, HOMEPAGE_AVATAR_BUTTON, HOMEPAGE_NATIVE_AVATAR_BUTTON } from './TestComponents/Avatar';
import { BadgeTest, HOMEPAGE_BADGE_BUTTON } from './TestComponents/Badge';
import { ButtonTest, HOMEPAGE_BUTTON_BUTTON } from './TestComponents/Button';
import { CalloutTest, HOMEPAGE_CALLOUT_BUTTON } from './TestComponents/Callout';
import { CheckboxTest, HOMEPAGE_CHECKBOX_BUTTON } from './TestComponents/Checkbox';
import { CornerRadiusTokensTest, HOMEPAGE_CORNERRADIUS_BUTTON } from './TestComponents/CornerRadius';
import { ExperimentalCheckboxTest, HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON } from './TestComponents/CheckboxExperimental';
import { ContextualMenuTest, HOMEPAGE_CONTEXTUALMENU_BUTTON } from './TestComponents/ContextualMenu';
import { NativeDatePickerTest, HOMEPAGE_NATIVEDATEPICKER_BUTTON } from './TestComponents/NativeDatePicker';
import { DropdownTest, HOMEPAGE_DROPDOWN_BUTTON } from './TestComponents/Dropdown';
// import { DrawerTest, HOMEPAGE_DRAWER_BUTTON } from './TestComponents/Drawer';
// import { ExpanderTest, HOMEPAGE_EXPANDER_BUTTON } from './TestComponents/Expander';
import { FocusTrapTest, HOMEPAGE_FOCUSTRAPZONE_BUTTON } from './TestComponents/FocusTrapZone';
import { FocusZoneTest, HOMEPAGE_FOCUSZONE_BUTTON } from './TestComponents/FocusZone';
import { IconTest, HOMEPAGE_ICON_BUTTON } from './TestComponents/Icon';
import { LinkTest, HOMEPAGE_LINK_BUTTON } from './TestComponents/Link';
import { MenuTest, HOMEPAGE_MENU_BUTTON } from './TestComponents/Menu';
import { MenuButtonTest, HOMEPAGE_MENUBUTTON_BUTTON } from './TestComponents/MenuButton';
import { ExperimentalMenuButtonTest, HOMEPAGE_EXPERIMENTAL_MENU_BUTTON } from './TestComponents/MenuButtonExperimental';
import { NotificationTest, HOMEPAGE_NOTIFICATION_BUTTON } from './TestComponents/Notification';
import { PersonaTest, HOMEPAGE_PERSONA_BUTTON } from './TestComponents/Persona';
import { PersonaCoinTest, HOMEPAGE_PERSONACOIN_BUTTON } from './TestComponents/PersonaCoin';
import { PressableTest, HOMEPAGE_PRESSABLE_BUTTON } from './TestComponents/Pressable';
import { RadioGroupTest, HOMEPAGE_RADIOGROUP_BUTTON } from './TestComponents/RadioGroup';
import { RadioGroupExperimentalTest, HOMEPAGE_RADIO_GROUP_EXPERIMENTAL_BUTTON } from './TestComponents/RadioGroupExperimental';
import { SeparatorTest, HOMEPAGE_SEPARATOR_BUTTON } from './TestComponents/Separator';
import { ShadowTest, HOMEPAGE_SHADOW_BUTTON } from './TestComponents/Shadow';
import { ShimmerTest, HOMEPAGE_SHIMMER_BUTTON } from './TestComponents/Shimmer';
import { SpacingTokensTest, HOMEPAGE_SPACING_BUTTON } from './TestComponents/Spacing';
import { StrokeWidthTest, HOMEPAGE_STROKEWIDTH_BUTTON } from './TestComponents/StrokeWidth';
import { SvgTest, HOMEPAGE_SVG_BUTTON } from './TestComponents/Svg';
import { SwitchTest, HOMEPAGE_SWITCH_BUTTON } from './TestComponents/Switch';
import { TabsTest, HOMEPAGE_TABS_BUTTON } from './TestComponents/Tabs';
import { ExperimentalTabsTest, HOMEPAGE_EXPERIMENTAL_TABS_BUTTON } from './TestComponents/TabsExperimental';
import { TextTest, HOMEPAGE_TEXT_BUTTON } from './TestComponents/Text';
import { TextExperimentalTest, HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON } from './TestComponents/TextExperimental';
import { ThemeTest, HOMEPAGE_THEME_BUTTON } from './TestComponents/Theme';
import { TokenTest, HOMEPAGE_TOKEN_BUTTON } from './TestComponents/Tokens';
import { ExperimentalLinkTest, HOMEPAGE_EXPERIMENTAL_LINK_BUTTON } from './TestComponents/LinkExperimental';

export const tests: TestDescription[] = [
  {
    name: 'ActivityIndicator',
    component: ActivityIndicatorTest,
    testPage: HOMEPAGE_ACTIVITY_INDICATOR_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Avatar',
    component: AvatarTest,
    testPage: HOMEPAGE_AVATAR_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Avatar (Native)',
    component: NativeAvatarTest,
    testPage: HOMEPAGE_NATIVE_AVATAR_BUTTON,
    platforms: ['ios', 'macos'],
  },
  {
    name: 'Badge',
    component: BadgeTest,
    testPage: HOMEPAGE_BADGE_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Button',
    component: ButtonTest,
    testPage: HOMEPAGE_BUTTON_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Callout',
    component: CalloutTest,
    testPage: HOMEPAGE_CALLOUT_BUTTON,
    platforms: ['android', 'macos', 'win32'],
  },
  {
    name: 'Checkbox',
    component: CheckboxTest,
    testPage: HOMEPAGE_CHECKBOX_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Checkbox (Experimental)',
    component: ExperimentalCheckboxTest,
    testPage: HOMEPAGE_CHECKBOX_EXPERIMENTAL_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'], // 'windows': GH#935: Temporarily disabling while SVGs don't work in windows
  },
  {
    name: 'ContextualMenu',
    component: ContextualMenuTest,
    testPage: HOMEPAGE_CONTEXTUALMENU_BUTTON,
    platforms: ['android', 'macos', 'win32'],
  },
  {
    name: 'Corner Radius Tokens',
    component: CornerRadiusTokensTest,
    testPage: HOMEPAGE_CORNERRADIUS_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Date Picker (Native)',
    component: NativeDatePickerTest,
    testPage: HOMEPAGE_NATIVEDATEPICKER_BUTTON,
    platforms: ['ios'],
  },
  {
    name: 'Dropdown',
    component: DropdownTest,
    testPage: HOMEPAGE_DROPDOWN_BUTTON,
    platforms: ['macos', 'win32'],
  },
  // {
  //   name: 'Drawer',
  //   component: DrawerTest,
  //   testPage: HOMEPAGE_DRAWER_BUTTON,
  //   platforms: ['android'],
  // },
  // GH##1027 Temporarily disabling while the test doesn't load
  // {
  //   name: 'Expander',
  //   component: ExpanderTest,
  //   testPage: HOMEPAGE_EXPANDER_BUTTON,
  //   platforms: ['windows'],
  // },
  {
    name: 'Focus Trap Zone',
    component: FocusTrapTest,
    testPage: HOMEPAGE_FOCUSTRAPZONE_BUTTON,
    platforms: ['android', 'win32'],
  },
  {
    name: 'FocusZone',
    component: FocusZoneTest,
    testPage: HOMEPAGE_FOCUSZONE_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'Icon',
    component: IconTest,
    testPage: HOMEPAGE_ICON_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'],
  },
  {
    name: 'Link',
    component: LinkTest,
    testPage: HOMEPAGE_LINK_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Link (Experimental)',
    component: ExperimentalLinkTest,
    testPage: HOMEPAGE_EXPERIMENTAL_LINK_BUTTON,
    platforms: ['win32'],
  },
  {
    name: 'Menu',
    component: MenuTest,
    testPage: HOMEPAGE_MENU_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'MenuButton',
    component: MenuButtonTest,
    testPage: HOMEPAGE_MENUBUTTON_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'MenuButton (Experimental)',
    component: ExperimentalMenuButtonTest,
    testPage: HOMEPAGE_EXPERIMENTAL_MENU_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'Notification',
    component: NotificationTest,
    testPage: HOMEPAGE_NOTIFICATION_BUTTON,
    platforms: ['android', 'ios'],
  },
  {
    name: 'Persona',
    component: PersonaTest,
    testPage: HOMEPAGE_PERSONA_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'PersonaCoin',
    component: PersonaCoinTest,
    testPage: HOMEPAGE_PERSONACOIN_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Pressable',
    component: PressableTest,
    testPage: HOMEPAGE_PRESSABLE_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'RadioGroup',
    component: RadioGroupTest,
    testPage: HOMEPAGE_RADIOGROUP_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'RadioGroup (Experimental)',
    component: RadioGroupExperimentalTest,
    testPage: HOMEPAGE_RADIO_GROUP_EXPERIMENTAL_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'Separator',
    component: SeparatorTest,
    testPage: HOMEPAGE_SEPARATOR_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Shadow',
    component: ShadowTest,
    testPage: HOMEPAGE_SHADOW_BUTTON,
    platforms: ['ios', 'macos', 'win32'],
  },
  {
    name: 'Shimmer',
    component: ShimmerTest,
    testPage: HOMEPAGE_SHIMMER_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'],
  },
  {
    name: 'Spacing Tokens',
    component: SpacingTokensTest,
    testPage: HOMEPAGE_SPACING_BUTTON,
    platforms: ['ios'],
  },
  {
    name: 'Stroke Width Tokens',
    component: StrokeWidthTest,
    testPage: HOMEPAGE_STROKEWIDTH_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Svg',
    component: SvgTest,
    testPage: HOMEPAGE_SVG_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'],
  },
  {
    name: 'Switch',
    component: SwitchTest,
    testPage: HOMEPAGE_SWITCH_BUTTON,
    platforms: ['win32'],
  },
  {
    name: 'Tabs',
    component: TabsTest,
    testPage: HOMEPAGE_TABS_BUTTON,
    platforms: ['macos', 'win32', 'windows'],
  },
  {
    name: 'Tabs (Experimental)',
    component: ExperimentalTabsTest,
    testPage: HOMEPAGE_EXPERIMENTAL_TABS_BUTTON,
    platforms: ['macos', 'win32', 'windows'],
  },
  {
    name: 'Text',
    component: TextTest,
    testPage: HOMEPAGE_TEXT_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Text (Experimental)',
    component: TextExperimentalTest,
    testPage: HOMEPAGE_EXPERIMENTAL_TEXT_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Theme',
    component: ThemeTest,
    testPage: HOMEPAGE_THEME_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Tokens',
    component: TokenTest,
    testPage: HOMEPAGE_TOKEN_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
];
