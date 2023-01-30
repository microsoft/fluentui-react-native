import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { NotificationTokens } from './Notification.types';
import { DynamicColorIOS } from 'react-native';

/**
 * Fluent 2 colors are not yet in the token pipeline for iOS so DynamicColorIOS is necessary for dark mode
 */
const notificationColors = {
  /**
   * None of the foreground tokens above have pressed versions so the foreground color with an alpha value is used.
   * The FluentUI Apple NotificationView was used to color match.
   */
  primaryPressed: DynamicColorIOS({
    light: '#0F6CBD30', // opacity: 0.19
    dark: '#77B7F756', // opacity: 0.34
  }),
  neutralPressed: DynamicColorIOS({
    light: '#61616145', // opacity: 0.27
    dark: '#D6D6D682', // opacity: 0.51
  }),
  dangerPressed: DynamicColorIOS({
    light: '#9F282C32', // opacity: 0.2
    dark: '#E37D8159', // opacity: 0.38
  }),
  warningPressed: DynamicColorIOS({
    light: '#4C440033', // opacity: 0.2
    dark: '#FDEE6564', // opacity: 0.39
  }),
};

export const defaultNotificationTokens: TokenSettings<NotificationTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.background,
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    color: t.colors.brandForeground1,
    fontFamily: 'primary',
    fontLetterSpacing: -0.24,
    fontLineHeight: 20,
    fontSize: 15,
    fontWeight: '400',
    minHeight: 52,
    padding: globalTokens.size160,
    paddingVertical: globalTokens.size120,
    shadowToken: t.shadows.shadow16,
    isBar: {
      borderRadius: 0,
      fontWeight: '400',
      shadowToken: undefined,
    },
    primary: {
      backgroundColor: t.colors.brandBackgroundTint,
      color: t.colors.brandForegroundTint,
      disabledColor: t.colors.brandForegroundDisabled1,
      pressedColor: notificationColors.primaryPressed,
    },
    neutral: {
      backgroundColor: t.colors.neutralBackground4,
      color: t.colors.neutralForeground2,
      disabledColor: t.colors.neutralForegroundDisabled2,
      pressedColor: notificationColors.neutralPressed,
    },
    primaryBar: {
      backgroundColor: t.colors.brandBackgroundTint,
      borderWidth: 0,
      color: t.colors.brandForegroundTint,
      disabledColor: t.colors.brandForegroundDisabled1,
      pressedColor: notificationColors.primaryPressed,
    },
    primaryOutlineBar: {
      backgroundColor: t.colors.neutralBackground1,
      borderColor: t.colors.neutralStroke2,
      color: t.colors.brandForeground1,
      disabledColor: t.colors.brandForegroundDisabled1,
      pressedColor: notificationColors.primaryPressed,
    },
    neutralBar: {
      backgroundColor: t.colors.neutralBackground5,
      borderWidth: 0,
      color: t.colors.neutralForeground2,
      disabledColor: t.colors.neutralForegroundDisabled2,
      pressedColor: notificationColors.neutralPressed,
    },
    danger: {
      backgroundColor: t.colors.dangerBackground1,
      color: t.colors.dangerForeground1,
      pressedColor: notificationColors.dangerPressed,
    },
    warning: {
      backgroundColor: t.colors.warningBackground1,
      color: t.colors.warningForeground1,
      pressedColor: notificationColors.warningPressed,
    },
  } as NotificationTokens);
