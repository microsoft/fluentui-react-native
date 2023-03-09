import type { ColorValue, TextInputProps, ViewProps } from 'react-native';

import type { IconProps, IconSourcesType } from '@fluentui-react-native/icon';
import type { TextProps } from '@fluentui-react-native/text';
import type { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const input = 'Input';
/**
 * This type is an example. Feel free to remove it.
 */
export type TextSize = 'small' | 'medium' | 'large';

export interface InputTokens extends LayoutTokens, IBorderTokens, IColorTokens {
  /**
   * The icon color.
   */
  iconColor?: ColorValue;

  /**
   * The size of the icon.
   */
  iconSize?: number;

  /**
   * The dismiss icon color.
   */
  dismissIconColor?: ColorValue;

  /**
   * The size of the dismiss icon.
   */
  dismissIconSize?: number;
}

export interface InputProps {
  /*
   * Source URL or name of the icon to show on the Button.
   */
  icon?: IconSourcesType;
  textSize?: TextSize;
  text?: string;
}

export interface InputSlotProps {
  root: ViewProps;
  label: TextProps;
  input: TextInputProps;
  inputWrapper: ViewProps;
  icon: IconProps;
  dismissIcon: IconProps;
  assistiveText: TextProps;
  secondaryText: TextProps;
}

export interface InputType {
  props: InputProps;
  tokens: InputTokens;
  slotProps: InputSlotProps;
}
