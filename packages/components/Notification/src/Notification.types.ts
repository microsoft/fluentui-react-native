import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const notification = 'Notification';
export const NotificationVariants = ['primary', 'neutral', 'danger', 'warning'] as const;
export type NotificationVariant = typeof NotificationVariants[number];

export interface NotificationTokens extends LayoutTokens, IBorderTokens, IColorTokens {
  primary: NotificationTokens;
  neutral: NotificationTokens;
  danger: NotificationTokens;
  warning: NotificationTokens;
}

export interface NotificationProps {
  /**
   * Notification variants: 'primary' | 'neutral' |'danger' | 'warning'
   */
  variant: NotificationVariant;
  endText: string;
}

export interface NotificationSlotProps {
  root: ViewProps;
  message: TextProps;
  endText: TextProps;
}

export interface NotificationType {
  props: NotificationProps;
  tokens: NotificationTokens;
  slotProps: NotificationSlotProps;
}
