import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { NotificationTokens } from './Notification.types';

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
      backgroundColor: '#EBF3FC', // brandBackground4
      color: '#0F6CBD', // brandForeground4
      disabledColor: '#2886DE', // brandForegroundDisabled
      /**
       * None of the foreground tokens here have pressed versions so the foreground color with an alpha value was used.
       * The FluentUI Apple NotificationView was used to color match.
       */
      pressedColor: '#0F6CBD30',
    },
    neutral: {
      backgroundColor: '#FAFAFA', // background4
      color: '#616161', // foreground2
      disabledColor: '#FFFFFF', // foregroundDisabled2
      pressedColor: '#61616145',
    },
    // hardcoded values from FluentUI Apple NotificationView
    danger: {
      backgroundColor: '#FDF6F6',
      color: '#BC2F34',
      pressedColor: '#BC2F3433',
    },
    // hardcoded values from FluentUI Apple NotificationView
    warning: {
      backgroundColor: '#FFFBD6',
      color: '#4C4400',
      pressedColor: '#4C440033',
    },
    primaryBar: {
      backgroundColor: '#EBF3FC', // brandBackground4
      borderWidth: 0,
      color: '#0F6CBD', // brandForeground4
      disabledColor: '#2886DE', // brandForegroundDisabled
      pressedColor: '#0F6CBD30',
    },
    primaryOutlineBar: {
      backgroundColor: '#FFFFFF', // background1
      borderColor: '#E0E0E0', // stroke2
      color: '#0F6CBD', // brandForeground1
      disabledColor: '#2886DE', // brandForegroundDisabled
      pressedColor: '#0F6CBD30',
    },
    neutralBar: {
      backgroundColor: '#F0F0F0', // background5
      borderWidth: 0,
      color: '#616161', // foreground2
      disabledColor: '#FFFFFF', // foregroundDisabled2
      pressedColor: '#61616145',
    },
  } as NotificationTokens);
