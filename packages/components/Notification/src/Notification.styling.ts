import { notification, NotificationTokens, NotificationSlotProps, NotificationProps } from './Notification.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultNotificationTokens } from './NotificationTokens';

export const notificationStates: (keyof NotificationTokens)[] = [
  'primary',
  'neutral',
  'primaryBar',
  'primaryOutlineBar',
  'neutralBar',
  'danger',
  'warning',
];

export const stylingSettings: UseStylingOptions<NotificationProps, NotificationSlotProps, NotificationTokens> = {
  tokens: [defaultNotificationTokens, notification],
  states: notificationStates,
  slotProps: {
    root: buildProps(
      (tokens: NotificationTokens, theme: Theme) => ({
        style: {
          backgroundColor: tokens.backgroundColor,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    message: buildProps(
      (tokens: NotificationTokens) => {
        return {
          style: {
            color: tokens.color,
            fontSize: 16,
            flex: 1,
            flexGrow: 1,
          },
        };
      },
      ['color'],
    ),
    endText: buildProps(
      (tokens: NotificationTokens) => {
        return {
          style: {
            color: tokens.color,
            fontSize: 16,
            fontWeight: '500',
            marginLeft: 34,
          },
        };
      },
      ['color'],
    ),
  },
};
