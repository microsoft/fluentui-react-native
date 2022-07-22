import { PressableProps } from 'react-native';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import { IViewProps, ITextProps } from '@fluentui-react-native/adapters';
import { ButtonProps } from '@fluentui-react-native/button';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { NotificationButtonColorStates } from './Notification.helper';

export const notification = 'Notification';
export const NotificationVariants = ['primary', 'neutral', 'primaryBar', 'primaryOutlineBar', 'neutralBar', 'danger', 'warning'] as const;
export type NotificationVariant = typeof NotificationVariants[number];

export interface NotificationTokens extends LayoutTokens, IBorderTokens, IColorTokens, FontTokens, NotificationButtonColorStates {
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

  /**
   * Whether or not the notification is currently visible
   */
  visible: boolean;

  /**
   * Optional icon that appears on the left side of toast notifications
   */
  icon?: IconSourcesType;

  /**
   * Optional icon that appears at the top of toast notifications
   */
  title?: string;

  /**
   * Text in the action button
   */
  action?: string;

  /**
   * Callback function that is triggered by pressing the entire notification
   */
  onPress?: (e: InteractionEvent) => void;

  /**
   * Callback function that is triggered by pressing the action button
   */
  onActionPress?: (e: InteractionEvent) => void;
}

export interface NotificationSlotProps {
  root: PressableProps;
  icon?: IconProps;
  contentContainer: IViewProps;
  title?: ITextProps;
  message: ITextProps;
  action?: ButtonProps;
}

export interface NotificationType {
  props: NotificationProps;
  tokens: NotificationTokens;
  slotProps: NotificationSlotProps;
}
