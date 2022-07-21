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
    fontLineHeight: 20,
    fontSize: 15,
    fontWeight: '600',
    padding: 16,
    hasTitle: {
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
      backgroundColor: '#EBF3FC', // brandBackground4
      color: '#0F6CBD', // brandForeground4
      disabledColor: '#2886DE', // brandForegroundDisabled
      /**
       * None of the foreground tokens here have pressed versions so the foreground color with an alpha value is used.
       * The FluentUI Apple NotificationView was used to color match.
       */
      pressedColor: '#0F6CBD30', // opacity: 0.19
    },
    neutral: {
      backgroundColor: '#FAFAFA', // background4
      color: '#616161', // foreground2
      disabledColor: '#FFFFFF', // foregroundDisabled2
      pressedColor: '#61616145', // opacity: 0.27
    },
    primaryBar: {
      backgroundColor: '#EBF3FC', // brandBackground4
      borderWidth: 0,
      color: '#0F6CBD', // brandForeground4
      disabledColor: '#2886DE', // brandForegroundDisabled
      pressedColor: '#0F6CBD30', // opacity: 0.19
    },
    primaryOutlineBar: {
      backgroundColor: '#FFFFFF', // background1
      borderColor: '#E0E0E0', // stroke2
      color: '#0F6CBD', // brandForeground1
      disabledColor: '#2886DE', // brandForegroundDisabled
      pressedColor: '#0F6CBD30', // opacity: 0.19
    },
    neutralBar: {
      backgroundColor: '#F0F0F0', // background5
      borderWidth: 0,
      color: '#616161', // foreground2
      disabledColor: '#FFFFFF', // foregroundDisabled2
      pressedColor: '#61616145', // opacity: 0.27
    },
    danger: {
      backgroundColor: '#FDF6F6', // PaletteRedBackground1
      color: '#9F282C', // PaletteRedForeground1
      pressedColor: '#9F282C32', // opacity: 0.2
    },
    warning: {
      backgroundColor: '#FFFBD6', // PaletteYellowBackground1
      color: '#4C4400', // PaletteYellowForeground1
      pressedColor: '#4C440033', // opacity: 0.2
    },
  } as NotificationTokens);
