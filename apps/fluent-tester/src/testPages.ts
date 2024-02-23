import type { TestDescription } from './TestComponents';
import { ActivityIndicatorTest } from './TestComponents/ActivityIndicator';
import { AvatarTest, NativeAvatarTest } from './TestComponents/Avatar';
import { BadgeTest } from './TestComponents/Badge';
import { ButtonTest } from './TestComponents/Button';
import { CalloutTest } from './TestComponents/Callout';
import { CheckboxLegacyTest } from './TestComponents/CheckboxLegacy';
import { CheckboxV1Test } from './TestComponents/CheckboxV1';
import { ChipTest } from './TestComponents/Chip';
import { ColorTokensTest } from './TestComponents/ColorTokens';
import { ContextualMenuTest } from './TestComponents/ContextualMenu';
import { CornerRadiusTokensTest } from './TestComponents/CornerRadius';
import { DividerTest } from './TestComponents/Divider';
import { DrawerTest } from './TestComponents/Drawer';
import { DropdownTest, HOMEPAGE_DROPDOWN_BUTTON } from './TestComponents/Dropdown';
// import { ExpanderTest, Constants.HOMEPAGE_EXPANDER_BUTTON } from './TestComponents/Expander';
import { FocusTrapTest } from './TestComponents/FocusTrapZone';
import { FocusZoneTest } from './TestComponents/FocusZone';
import { IconTest } from './TestComponents/Icon';
import { InputTest } from './TestComponents/Input';
import { LinkLegacyTest } from './TestComponents/LinkLegacy';
import { LinkV1Test } from './TestComponents/LinkV1';
import { MenuTest } from './TestComponents/Menu';
import { MenuButtonLegacyTest } from './TestComponents/MenuButtonLegacy';
import { MenuButtonV1Test } from './TestComponents/MenuButtonV1';
import { NativeDatePickerTest, HOMEPAGE_NATIVEDATEPICKER_BUTTON } from './TestComponents/NativeDatePicker';
import { NotificationTest, HOMEPAGE_NOTIFICATION_BUTTON } from './TestComponents/Notification';
import { PersonaTest } from './TestComponents/Persona';
import { PersonaCoinTest } from './TestComponents/PersonaCoin';
import { PressableTest } from './TestComponents/Pressable';
import { RadioGroupLegacyTest } from './TestComponents/RadioGroupLegacy';
import { RadioGroupV1Test } from './TestComponents/RadioGroupV1';
import { SeparatorTest } from './TestComponents/Separator';
import { ShadowTest } from './TestComponents/Shadow';
import { ShimmerTest } from './TestComponents/Shimmer';
import { SpacingTokensTest } from './TestComponents/Spacing';
import { SpinnerTest } from './TestComponents/Spinner';
import { StrokeWidthTest } from './TestComponents/StrokeWidth';
import { SvgTest, RNSVGIconsTest } from './TestComponents/Svg';
import { SwitchTest } from './TestComponents/Switch';
import { TabListTest } from './TestComponents/TabList/TabListTest';
import { TextLegacyTest } from './TestComponents/TextLegacy';
import { TextV1Test } from './TestComponents/TextV1';
import { ThemeTest } from './TestComponents/Theme';
import { TooltipTest } from './TestComponents/Tooltip';
import { VibrancyViewTest } from './TestComponents/VibrancyView';
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
    component: CheckboxLegacyTest,
    testPageButton: Constants.HOMEPAGE_CHECKBOX_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Checkbox V1',
    component: CheckboxV1Test,
    testPageButton: Constants.HOMEPAGE_CHECKBOXV1_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'], // 'windows': GH#935: Temporarily disabling while SVGs don't work in windows
  },
  {
    name: 'Chip',
    component: ChipTest,
    testPageButton: Constants.HOMEPAGE_CHIP_BUTTON,
    platforms: ['android', 'ios'],
  },
  {
    name: 'Color Tokens',
    component: ColorTokensTest,
    testPageButton: Constants.HOMEPAGE_COLORTOKEN_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
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
    platforms: ['ios', 'android'],
  },
  {
    name: 'Divider',
    component: DividerTest,
    testPageButton: Constants.HOMEPAGE_DIVIDER_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Dropdown',
    component: DropdownTest,
    testPageButton: HOMEPAGE_DROPDOWN_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'Drawer',
    component: DrawerTest,
    testPageButton: Constants.HOMEPAGE_Drawer_BUTTON,
    platforms: ['android'],
  },
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
    platforms: ['win32'],
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
    name: 'Input',
    component: InputTest,
    testPageButton: Constants.HOMEPAGE_INPUT_BUTTON,
    platforms: ['android', 'ios'],
  },
  {
    name: 'Link Legacy',
    component: LinkLegacyTest,
    testPageButton: Constants.HOMEPAGE_LINK_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Link V1',
    component: LinkV1Test,
    testPageButton: Constants.HOMEPAGE_LINKV1_BUTTON,
    platforms: ['win32', 'android'],
  },
  {
    name: 'Menu',
    component: MenuTest,
    testPageButton: Constants.HOMEPAGE_MENU_BUTTON,
    platforms: ['macos', 'win32', 'android'],
  },
  {
    name: 'MenuButton Legacy',
    component: MenuButtonLegacyTest,
    testPageButton: Constants.HOMEPAGE_MENUBUTTON_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'MenuButton V1',
    component: MenuButtonV1Test,
    testPageButton: Constants.HOMEPAGE_MENUBUTTONV1_BUTTON,
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
    component: RadioGroupLegacyTest,
    testPageButton: Constants.HOMEPAGE_RADIOGROUP_BUTTON,
    platforms: ['macos', 'win32'],
  },
  {
    name: 'RadioGroup V1',
    component: RadioGroupV1Test,
    testPageButton: Constants.HOMEPAGE_RADIOGROUPV1_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'],
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
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Spinner V1',
    component: SpinnerTest,
    testPageButton: Constants.HOMEPAGE_SPINNER_BUTTON,
    platforms: ['android', 'win32'],
  },
  {
    name: 'Stroke Width Tokens',
    component: StrokeWidthTest,
    testPageButton: Constants.HOMEPAGE_STROKEWIDTH_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Svg rendering',
    component: SvgTest,
    testPageButton: Constants.HOMEPAGE_SVG_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'],
  },
  {
    name: 'Svg Icon packages',
    component: RNSVGIconsTest,
    testPageButton: Constants.HOMEPAGE_RNSVGIcons_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32'],
  },
  {
    name: 'Switch',
    component: SwitchTest,
    testPageButton: Constants.HOMEPAGE_SWITCH_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'TabList',
    component: TabListTest,
    testPageButton: Constants.HOMEPAGE_TABLIST_BUTTON,
    platforms: ['macos', 'win32', 'windows'],
  },
  {
    name: 'Text Legacy',
    component: TextLegacyTest,
    testPageButton: Constants.HOMEPAGE_TEXT_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Text V1',
    component: TextV1Test,
    testPageButton: Constants.HOMEPAGE_TEXTV1_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Theme',
    component: ThemeTest,
    testPageButton: Constants.HOMEPAGE_THEME_BUTTON,
    platforms: ['android', 'ios', 'macos', 'win32', 'windows'],
  },
  {
    name: 'Tooltip',
    component: TooltipTest,
    testPageButton: Constants.HOMEPAGE_TOOLTIP_BUTTON,
    platforms: ['win32'],
  },
  {
    name: 'Vibrancy View',
    component: VibrancyViewTest,
    testPageButton: Constants.HOMEPAGE_VIBRANCYVIEW_BUTTON,
    platforms: ['macos'],
  },
];
