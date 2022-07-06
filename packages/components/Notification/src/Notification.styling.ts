import { notification, NotificationTokens, NotificationSlotProps, NotificationProps } from './Notification.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultNotificationTokens } from './NotificationTokens';
import { TextStyle } from 'react-native';

export const notificationStates: (keyof NotificationTokens)[] = [
  'primary',
  'neutral',
  'primaryBar',
  'primaryOutlineBar',
  'neutralBar',
  'danger',
  'warning',
  'hasTitle',
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
          marginHorizontal: 16,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    inner: buildProps(() => {
      return {
        style: {
          flex: 1,
          flexDirection: 'column',
        },
      };
    }),
    title: buildProps(
      (tokens: NotificationTokens) => {
        return {
          style: {
            color: tokens.color,
            fontSize: 15,
            fontWeight: '600',
            lineHeight: 20,
            letterSpacing: -0.24,
            flex: 1,
            flexGrow: 1,
          },
        };
      },
      ['color'],
    ),
    message: buildProps(
      (tokens: NotificationTokens) => {
        return {
          style: {
            color: tokens.color,
            fontSize: tokens.fontSize,
            fontWeight: tokens.fontWeight,
            lineHeight: tokens.fontLineHeight,
            letterSpacing: tokens.fontLetterSpacing,
            flex: 1,
            flexGrow: 1,
          },
        };
      },
      ['color'],
    ) as TextStyle,
    action: buildProps(
      (tokens: NotificationTokens) => {
        return {
          style: {
            color: tokens.color,
            marginLeft: 16,
            alignSelf: 'center',
          },
          appearance: 'subtle',
          padding: 0,
          paddingHorizontal: 0,
          minWidth: 0,
        };
      },
      ['color'],
    ),
  },
};
