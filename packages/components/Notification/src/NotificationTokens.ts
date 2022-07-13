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
      backgroundColor: '#EBF3FC',
      color: '#0F6CBD',

      disabledColor: '#2886DE',
    },
    neutral: {
      backgroundColor: '#FAFAFA',
      color: '#616161',
    },
    danger: {
      backgroundColor: '#FDF6F6',
      color: '#BC2F34',
    },
    warning: {
      backgroundColor: '#FFFBD6',
      color: '#4C4400',
    },
    primaryBar: {
      backgroundColor: '#EBF3FC',
      borderWidth: 0,
      color: '#0F6CBD',

      disabledColor: '#2886DE',
    },
    primaryOutlineBar: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E0E0E0',
      color: '#0F6CBD',

      disabledColor: '#2886DE',
      hoveredColor: '0F548C',
      pressedColor: '#0E4775',
    },
    neutralBar: {
      backgroundColor: '#F0F0F0',
      borderWidth: 0,
      color: '#616161',

      disabledColor: '#FFFFFF',
    },
  } as NotificationTokens);
