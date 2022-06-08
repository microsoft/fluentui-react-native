import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const shadow = 'Shadow';
/**
 * This type is an example. Feel free to remove it.
 */
export type TextSize = 'small' | 'medium' | 'large';

export interface ShadowTokens extends LayoutTokens, IBorderTokens, IColorTokens {
  small?: ShadowTokens;
  medium?: ShadowTokens;
  large?: ShadowTokens;
}

export interface ShadowProps {
  textSize?: TextSize;
  text?: string;
}

export interface ShadowSlotProps {
  root: ViewProps;
  text: TextProps;
}

export interface ShadowType {
  props: ShadowProps;
  tokens: ShadowTokens;
  slotProps: ShadowSlotProps;
}
