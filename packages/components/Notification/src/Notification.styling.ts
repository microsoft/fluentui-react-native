import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';

import { notification } from './Notification.types';
import type { NotificationTokens, NotificationSlotProps, NotificationProps } from './Notification.types';
import { defaultNotificationTokens } from './NotificationTokens';

export const notificationStates: (keyof NotificationTokens)[] = [
  'primary',
  'neutral',
  'primaryBar',
  'primaryOutlineBar',
  'neutralBar',
  'danger',
  'warning',
  'isBar',
];

export const stylingSettings: UseStylingOptions<NotificationProps, NotificationSlotProps, NotificationTokens> = {
  tokens: [defaultNotificationTokens, notification],
  states: notificationStates,
  slotProps: {
    root: buildProps(
      (tokens: NotificationTokens, theme: Theme) => ({
        style: {
          backgroundColor: tokens.backgroundColor,
          borderColor: tokens.borderColor,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    icon: buildProps(
      (tokens: NotificationTokens) => ({
        style: {
          alignSelf: 'center',
          marginEnd: 16,
        },
        color: tokens.color,
        height: 24,
        width: 24,
      }),
      ['color'],
    ),
    contentContainer: buildProps(() => {
      return {
        style: {
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        },
      };
    }),
    title: buildProps(
      (tokens: NotificationTokens) => {
        return {
          style: {
            color: tokens.color,
          },
        };
      },
      ['color'],
    ),
    message: buildProps(
      (tokens: NotificationTokens, theme: Theme) => {
        return {
          style: {
            color: tokens.color,
            ...fontStyles.from(tokens, theme),
          },
        };
      },
      ['color', ...fontStyles.keys],
    ),
    action: buildProps(
      (tokens: NotificationTokens) => {
        return {
          style: {
            alignSelf: 'center',
            marginStart: 16,
          },
          appearance: 'subtle',
          color: tokens.color,
          disabledColor: tokens.disabledColor,
          pressedColor: tokens.pressedColor,
          minWidth: 0,
          padding: 0,
          paddingHorizontal: 0,
        };
      },
      ['color', ...fontStyles.keys],
    ),
    shadow: buildProps(
      (tokens: NotificationTokens) => ({
        shadowToken: tokens.shadowToken,
      }),
      ['shadowToken'],
    ),
  },
};
