import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { NotificationTokens } from './Notification.types';

export const defaultNotificationTokens: TokenSettings<NotificationTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: 'skyblue',
    color: t.colors.bodyText,
    borderRadius: 12,
    padding: 16,
    neutral: {
      backgroundColor: 'lightgrey',
    },
    danger: {
      backgroundColor: 'pink',
      color: 'maroon',
    },
    warning: {
      backgroundColor: 'lightyellow',
      color: 'brown',
    },
  } as NotificationTokens);
