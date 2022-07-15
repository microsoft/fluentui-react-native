import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { NotificationTokens } from './Notification.types';
import { notificationColors } from './NotificationTokens.ios';

export const defaultNotificationTokens: TokenSettings<NotificationTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.background,
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    color: t.colors.brandForeground1,
    fontFamily: 'primary',
    fontLetterSpacing: -0.24, // iOS only prop
    fontLineHeight: 20,
    fontSize: 15,
    fontWeight: '600',
    padding: 16,
    hasTitle: {
      fontLetterSpacing: -0.08, // iOS only prop
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
      pressedColor: '#0F6CBD30',
    },
    neutral: {
      backgroundColor: notificationColors.background4,
      color: notificationColors.foreground2,
      disabledColor: notificationColors.foregroundDisabled2,
      pressedColor: '#61616145',
    },
    danger: {
      backgroundColor: notificationColors.PaletteRedBackground1,
      color: notificationColors.PaletteRedForeground1,
      pressedColor: '#BC2F3433',
    },
    warning: {
      backgroundColor: notificationColors.PaletteYellowBackground1,
      color: notificationColors.PaletteYellowForeground1,
      // color: '#4C4400',
      pressedColor: '#4C440033',
    },
    primaryBar: {
      backgroundColor: notificationColors.brandBackground4,
      borderWidth: 0,
      color: notificationColors.brandForeground4,
      disabledColor: notificationColors.brandForegroundDisabled,
      pressedColor: '#0F6CBD30',
    },
    primaryOutlineBar: {
      backgroundColor: notificationColors.background1,
      borderColor: notificationColors.stroke2,
      color: notificationColors.brandForeground1,
      disabledColor: notificationColors.brandForegroundDisabled,
      pressedColor: '#0F6CBD30',
    },
    neutralBar: {
      backgroundColor: notificationColors.background5,
      borderWidth: 0,
      color: notificationColors.foreground2,
      disabledColor: notificationColors.foregroundDisabled2,
      pressedColor: '#61616145',
    },
  } as NotificationTokens);
