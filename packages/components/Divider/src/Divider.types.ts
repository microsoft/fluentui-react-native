import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/text';
import { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const divider = 'Divider';
/**
 * This type is an example. Feel free to remove it.
 */
export type TextSize = 'small' | 'medium' | 'large';

export interface DividerTokens extends LayoutTokens, IBorderTokens, IColorTokens {
  small?: DividerTokens;
  medium?: DividerTokens;
  large?: DividerTokens;
}

export interface DividerProps {
  textSize?: TextSize;
  text?: string;
}

export interface DividerSlotProps {
  root: ViewProps;
  text: TextProps;
}

export interface DividerType {
  props: DividerProps;
  tokens: DividerTokens;
  slotProps: DividerSlotProps;
}
