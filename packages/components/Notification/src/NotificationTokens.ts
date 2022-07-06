import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { NotificationTokens } from './Notification.types';

export const defaultNotificationTokens: TokenSettings<NotificationTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.background,
    color: t.colors.brandForeground1,
    fontSize: 15,
    fontWeight: '600',
    fontLineHeight: 20,
    fontLetterSpacing: -0.24,
    borderColor: 'transparent',
    borderWidth: 1,
    padding: 16,
    hasTitle: {
      paddingVertical: 12,
      fontSize: 13,
      fontWeight: '400',
      fontLineHeight: 18,
      fontLetterSpacing: -0.08,
    },
    primary: {
      backgroundColor: '#EBF3FC',
      color: '#0F6CBD',
      borderRadius: 12,
    },
    neutral: {
      backgroundColor: '#FAFAFA',
      color: '#616161',
      borderRadius: 12,
    },
    danger: {
      backgroundColor: '#FDF6F6',
      color: '#BC2F34',
      borderRadius: 12,
    },
    warning: {
      backgroundColor: '#FFFBD6',
      color: '#4C4400',
      borderRadius: 12,
    },
  } as NotificationTokens);
