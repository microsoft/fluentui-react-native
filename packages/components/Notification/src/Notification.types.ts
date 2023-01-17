import { PressableProps } from 'react-native';
import { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import { IViewProps, ITextProps } from '@fluentui-react-native/adapters';
import { ButtonProps } from '@fluentui-react-native/button';
import { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';
import { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import { NotificationButtonColorStates } from './Notification.helper';
import { ShadowProps } from '@fluentui-react-native/experimental-shadow';
import { ShadowToken } from '@fluentui-react-native/theme-types';

export const notification = 'Notification';
export const NotificationVariants = ['primary', 'neutral', 'primaryBar', 'primaryOutlineBar', 'neutralBar', 'danger', 'warning'] as const;
export type NotificationVariant = (typeof NotificationVariants)[number];

export interface NotificationTokens extends LayoutTokens, IBorderTokens, IColorTokens, FontTokens, NotificationButtonColorStates {
  primary: NotificationTokens;
  neutral: NotificationTokens;
  primaryBar: NotificationTokens;
  primaryOutlineBar: NotificationTokens;
  neutralBar: NotificationTokens;
  danger: NotificationTokens;
  warning: NotificationTokens;
  isBar: NotificationTokens;
  shadowToken?: ShadowToken;
}

export interface NotificationProps {
  /**
   * Notification variants: 'primary' | 'neutral' | 'primaryBar' | 'primaryOutlineBar' | 'neutralBar' | 'danger' | 'warning'
   */
  variant: NotificationVariant;

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
  shadow?: ShadowProps;
}

export interface NotificationType {
  props: NotificationProps;
  tokens: NotificationTokens;
  slotProps: NotificationSlotProps;
}
