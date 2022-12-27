import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { NotificationTokens } from './Notification.types';
import { DynamicColorIOS } from 'react-native';

const notificationShadowStyle = {
  ambient: { x: 0, y: 8, blur: 8, color: '#00000024' },
  key: { x: 0, y: 0, blur: 1, color: '#0000001f' },
};

/**
 * Fluent 2 colors are not yet in the token pipeline for iOS so DynamicColorIOS is necessary for dark mode
 */
const notificationColors = {
  background1: DynamicColorIOS({
    light: '#FFFFFF',
    dark: '#000000',
  }),
  background4: DynamicColorIOS({
    light: '#FAFAFA',
    dark: '#333333',
  }),
  background5: DynamicColorIOS({
    light: '#F0F0F0',
    dark: '#3D3D3D',
  }),
  brandBackground4: DynamicColorIOS({
    light: '#EBF3FC',
    dark: '#082338',
  }),
  brandForeground1: DynamicColorIOS({
    light: '#0F6CBD',
    dark: '#479EF5',
  }),
  brandForeground4: DynamicColorIOS({
    light: '#0F6CBD',
    dark: '#77B7F7',
  }),
  brandForegroundDisabled: DynamicColorIOS({
    light: '#2886DE',
    dark: '#2886DE', // not yet defined
  }),
  foreground2: DynamicColorIOS({
    light: '#616161',
    dark: '#D6D6D6',
  }),
  foregroundDisabled2: DynamicColorIOS({
    light: '#FFFFFF',
    dark: '#3D3D3D',
  }),
  stroke2: DynamicColorIOS({
    light: '#E0E0E0',
    dark: '#3D3D3D',
  }),
  PaletteRedBackground1: DynamicColorIOS({
    light: '#FDF6F6',
    dark: '#3F1011',
  }),
  PaletteRedForeground1: DynamicColorIOS({
    light: '#9F282C',
    dark: '#E37D81',
  }),
  PaletteYellowBackground1: DynamicColorIOS({
    light: '#FFFBD6',
    dark: '#4C4400',
  }),
  PaletteYellowForeground1: DynamicColorIOS({
    light: '#4C4400',
    dark: '#FDEE65',
  }),

  /**
   * None of the foreground tokens above have pressed versions so the foreground color with an alpha value is used.
   * The FluentUI Apple NotificationView was used to color match.
   */
  primaryPressed: DynamicColorIOS({
    light: '#0F6CBD30', // opacity: 0.19
    dark: '#77B7F756', // opacity: 0.34
  }),
  neutralPressed: DynamicColorIOS({
    light: '#61616145', // opacity: 0.27
    dark: '#D6D6D682', // opacity: 0.51
  }),
  dangerPressed: DynamicColorIOS({
    light: '#9F282C32', // opacity: 0.2
    dark: '#E37D8159', // opacity: 0.38
  }),
  warningPressed: DynamicColorIOS({
    light: '#4C440033', // opacity: 0.2
    dark: '#FDEE6564', // opacity: 0.39
  }),
};

export const defaultNotificationTokens: TokenSettings<NotificationTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.background,
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    color: t.colors.brandForeground1,
    fontFamily: 'primary',
    fontLetterSpacing: -0.24,
    fontLineHeight: 20,
    fontSize: 15,
    fontWeight: '400',
    minHeight: 52,
    padding: globalTokens.size160,
    paddingVertical: globalTokens.size120,
    shadowToken: notificationShadowStyle,
    isBar: {
      borderRadius: 0,
      fontWeight: '400',
      shadowToken: undefined,
    },
    primary: {
      backgroundColor: notificationColors.brandBackground4,
      color: notificationColors.brandForeground4,
      disabledColor: notificationColors.brandForegroundDisabled,
      pressedColor: notificationColors.primaryPressed,
    },
    neutral: {
      backgroundColor: notificationColors.background4,
      color: notificationColors.foreground2,
      disabledColor: notificationColors.foregroundDisabled2,
      pressedColor: notificationColors.neutralPressed,
    },
    primaryBar: {
      backgroundColor: notificationColors.brandBackground4,
      borderWidth: 0,
      color: notificationColors.brandForeground4,
      disabledColor: notificationColors.brandForegroundDisabled,
      pressedColor: notificationColors.primaryPressed,
    },
    primaryOutlineBar: {
      backgroundColor: notificationColors.background1,
      borderColor: notificationColors.stroke2,
      color: notificationColors.brandForeground1,
      disabledColor: notificationColors.brandForegroundDisabled,
      pressedColor: notificationColors.primaryPressed,
    },
    neutralBar: {
      backgroundColor: notificationColors.background5,
      borderWidth: 0,
      color: notificationColors.foreground2,
      disabledColor: notificationColors.foregroundDisabled2,
      pressedColor: notificationColors.neutralPressed,
    },
    danger: {
      backgroundColor: notificationColors.PaletteRedBackground1,
      color: notificationColors.PaletteRedForeground1,
      pressedColor: notificationColors.dangerPressed,
    },
    warning: {
      backgroundColor: notificationColors.PaletteYellowBackground1,
      color: notificationColors.PaletteYellowForeground1,
      pressedColor: notificationColors.warningPressed,
    },
  } as NotificationTokens);
