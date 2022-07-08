import { notification, NotificationTokens, NotificationSlotProps, NotificationProps } from './Notification.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultNotificationTokens } from './NotificationTokens';

export const notificationStates: (keyof NotificationTokens)[] = [
  'primary',
  'neutral',
  'primaryBar',
  'primaryOutlineBar',
  'neutralBar',
  'danger',
  'warning',
  'hasTitle',
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
          marginHorizontal: tokens.marginHorizontal,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    contentContainer: buildProps(() => {
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
            flex: 1,
            flexGrow: 1,
            fontSize: 15,
            fontWeight: '600',
            letterSpacing: -0.24, // iOS only prop
            lineHeight: 20,
          },
        };
      },
      ['color'],
    ),
    message: buildProps(
      (tokens: NotificationTokens, theme: Theme) => {
        return {
          style: {
            alignSelf: tokens.alignSelf,
            color: tokens.color,
            flex: 1,
            flexGrow: 1,
            ...fontStyles.from(tokens, theme),
          },
        };
      },
      ['alignSelf', 'color', ...fontStyles.keys],
    ),
    action: buildProps(
      (tokens: NotificationTokens) => {
        return {
          style: {
            alignSelf: 'center',
            color: tokens.color,
            marginLeft: 16,
          },
          appearance: 'subtle',
          minWidth: 0,
          padding: 0,
          paddingHorizontal: 0,
        };
      },
      ['color'],
    ),
  },
};
