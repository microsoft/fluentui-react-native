import { PressableProps, ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { ButtonProps } from '@fluentui-react-native/button';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';

export const notification = 'Notification';
export const NotificationVariants = ['primary', 'neutral', 'primaryBar', 'primaryOutlineBar', 'neutralBar', 'danger', 'warning'] as const;
export type NotificationVariant = typeof NotificationVariants[number];

export interface NotificationTokens extends LayoutTokens, IBorderTokens, IColorTokens, FontTokens {
  primary: NotificationTokens;
  neutral: NotificationTokens;
  primaryBar: NotificationTokens;
  primaryOutlineBar: NotificationTokens;
  neutralBar: NotificationTokens;
  danger: NotificationTokens;
  warning: NotificationTokens;
  hasTitle: NotificationTokens;
}

export interface NotificationProps {
  /**
   * Notification variants: 'primary' | 'neutral' | 'primaryBar' | 'primaryOutlineBar' | 'neutralBar' | 'danger' | 'warning'
   */
  variant: NotificationVariant;
  title?: string;
  action?: string;
  onPress?: (e: InteractionEvent) => void;
}

export interface NotificationSlotProps {
  root: PressableProps;
  inner: ViewProps;
  title: TextProps;
  message: TextProps;
  action?: ButtonProps;
}

export interface NotificationType {
  props: NotificationProps;
  tokens: NotificationTokens;
  slotProps: NotificationSlotProps;
}
