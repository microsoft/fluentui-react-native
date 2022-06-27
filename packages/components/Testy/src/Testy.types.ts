import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const testy = 'Testy';
/**
 * This type is an example. Feel free to remove it.
 */
export type TextSize = 'small' | 'medium' | 'large';

export interface TestyTokens extends LayoutTokens, IBorderTokens, IColorTokens {
  small?: TestyTokens;
  medium?: TestyTokens;
  large?: TestyTokens;
}

export interface TestyProps {
  textSize?: TextSize;
  text?: string;
}

export interface TestySlotProps {
  root: ViewProps;
  text: TextProps;
}

export interface TestyType {
  props: TestyProps;
  tokens: TestyTokens;
  slotProps: TestySlotProps;
}
