import type { IPressableProps } from '@fluentui-react-native/pressable';

import type { IViewProps, ITextProps } from '@fluentui-react-native/adapters';
import type { ButtonProps } from '@fluentui-react-native/button';
import type { ShadowProps } from '@fluentui-react-native/experimental-shadow';
import type { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import type { InteractionEvent } from '@fluentui-react-native/interactive-hooks';
import type { ShadowToken } from '@fluentui-react-native/theme-types';
import type { FontTokens, IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

import type { NotificationButtonColorStates } from './Notification.helper';

export const notification = 'Notification';
export const NotificationVariants = ['primary', 'neutral', 'primaryBar', 'primaryOutlineBar', 'neutralBar', 'danger', 'warning'] as const;
export type NotificationVariant = (typeof NotificationVariants)[number];

export interface NotificationTokens extends LayoutTokens, IBorderTokens, IColorTokens, FontTokens, NotificationButtonColorStates {
  primary?: NotificationTokens;
  neutral?: NotificationTokens;
  primaryBar?: NotificationTokens;
  primaryOutlineBar?: NotificationTokens;
  neutralBar?: NotificationTokens;
  danger?: NotificationTokens;
  warning?: NotificationTokens;
  isBar?: NotificationTokens;
  shadowToken?: ShadowToken;
}

export type NotificationProps = React.PropsWithChildren<{
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
}>;

export interface NotificationSlotProps {
  root: IPressableProps;
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
