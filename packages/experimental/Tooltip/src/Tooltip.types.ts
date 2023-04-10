import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/text';
import { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const tooltip = 'Tooltip';
/**
 * This type is an example. Feel free to remove it.
 */
export type TextSize = 'small' | 'medium' | 'large';

export interface TooltipTokens extends LayoutTokens, IBorderTokens, IColorTokens {
  small?: TooltipTokens;
  medium?: TooltipTokens;
  large?: TooltipTokens;
}

export interface TooltipProps {
  textSize?: TextSize;
  text?: string;
}

export interface TooltipSlotProps {
  root: ViewProps;
  text: TextProps;
}

export interface TooltipType {
  props: TooltipProps;
  tokens: TooltipTokens;
  slotProps: TooltipSlotProps;
}
