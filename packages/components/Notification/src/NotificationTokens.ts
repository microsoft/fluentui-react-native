import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { NotificationTokens } from './Notification.types';

export const defaultNotificationTokens: TokenSettings<NotificationTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.background,
    color: t.colors.brandForeground1,
    borderColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    primary: {
      backgroundColor: '#EFF6FC',
      color: '#106EBE',
    },
    neutral: {
      backgroundColor: '#F7F7F7',
      color: '#393939',
    },
    danger: {
      backgroundColor: '#FDF6F6',
      color: '#BC2F34',
    },
    warning: {
      backgroundColor: '#FFFBD6',
      color: '#4C4400',
    },
  } as NotificationTokens);
