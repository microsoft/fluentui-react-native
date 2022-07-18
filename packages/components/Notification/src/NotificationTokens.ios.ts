import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { NotificationTokens } from './Notification.types';
import { DynamicColorIOS } from 'react-native';

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
    fontWeight: '600',
    padding: 16,
    hasTitle: {
      fontLetterSpacing: -0.08,
      fontLineHeight: 18,
      fontSize: 13,
      fontWeight: '400',
      paddingVertical: 12,
    },
    isBar: {
      borderRadius: 0,
      fontWeight: '400',
    },
    primary: {
      backgroundColor: notificationColors.brandBackground4,
      color: notificationColors.brandForeground4,
      // color: '#0F6CBD',
      disabledColor: notificationColors.brandForegroundDisabled,
      /**
       * None of the foreground tokens here have pressed versions so the foreground color with an alpha value was used.
       * The FluentUI Apple NotificationView was used to color match.
       */
      pressedColor: '#0F6CBD30', // opacity: 0.19
    },
    neutral: {
      backgroundColor: notificationColors.background4,
      color: notificationColors.foreground2,
      disabledColor: notificationColors.foregroundDisabled2,
      pressedColor: '#61616145', // opacity: 0.27
    },
    danger: {
      backgroundColor: notificationColors.PaletteRedBackground1,
      color: notificationColors.PaletteRedForeground1,
      pressedColor: '#9F282C32', // opacity: 0.2
    },
    warning: {
      backgroundColor: notificationColors.PaletteYellowBackground1,
      color: notificationColors.PaletteYellowForeground1,
      // color: '#4C4400',
      pressedColor: '#4C440033', // opacity: 0.2
    },
    primaryBar: {
      backgroundColor: notificationColors.brandBackground4,
      borderWidth: 0,
      color: notificationColors.brandForeground4,
      disabledColor: notificationColors.brandForegroundDisabled,
      pressedColor: '#0F6CBD30', // opacity: 0.19
    },
    primaryOutlineBar: {
      backgroundColor: notificationColors.background1,
      borderColor: notificationColors.stroke2,
      color: notificationColors.brandForeground1,
      disabledColor: notificationColors.brandForegroundDisabled,
      pressedColor: '#0F6CBD30', // opacity: 0.19
    },
    neutralBar: {
      backgroundColor: notificationColors.background5,
      borderWidth: 0,
      color: notificationColors.foreground2,
      disabledColor: notificationColors.foregroundDisabled2,
      pressedColor: '#61616145', // opacity: 0.27
    },
  } as NotificationTokens);
