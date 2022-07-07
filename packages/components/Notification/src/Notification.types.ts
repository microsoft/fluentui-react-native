import { PressableProps } from 'react-native';
import { IViewProps, ITextProps } from '@fluentui-react-native/adapters';
import { ButtonProps } from '@fluentui-react-native/button';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { FlexStyle } from 'react-native';

export const notification = 'Notification';
export const NotificationVariants = ['primary', 'neutral', 'primaryBar', 'primaryOutlineBar', 'neutralBar', 'danger', 'warning'] as const;
export type NotificationVariant = typeof NotificationVariants[number];

export interface NotificationTokens extends LayoutTokens, IBorderTokens, IColorTokens, FontTokens, FlexStyle {
  primary: NotificationTokens;
  neutral: NotificationTokens;
  primaryBar: NotificationTokens;
  primaryOutlineBar: NotificationTokens;
  neutralBar: NotificationTokens;
  danger: NotificationTokens;
  warning: NotificationTokens;
  hasTitle: NotificationTokens;
  isBar: NotificationTokens;
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
  contentContainer: IViewProps;
  title: ITextProps;
  message: ITextProps;
  action?: ButtonProps;
}

export interface NotificationType {
  props: NotificationProps;
  tokens: NotificationTokens;
  slotProps: NotificationSlotProps;
}
