import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { NotificationTokens } from './Notification.types';

export const defaultNotificationTokens: TokenSettings<NotificationTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.background,
    color: t.colors.brandForeground1,
    padding: 16,
    primary: {
      backgroundColor: '#EFF6FC',
      color: '#106EBE',
      borderRadius: 12,
    },
    neutral: {
      backgroundColor: '#F7F7F7',
      color: '#393939',
      borderRadius: 12,
    },
    primaryBar: {
      backgroundColor: '#EFF6FC',
      color: '#005A9E',
    },
    primaryOutlineBar: {
      backgroundColor: '#FFFFFF',
      color: '#0078D4',
    },
    neutralBar: {
      backgroundColor: '#DFDFDF',
      color: '#090909',
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
