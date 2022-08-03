import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/text';
import { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const radioGroupExperimental = 'RadioGroupExperimental';
/**
 * This type is an example. Feel free to remove it.
 */
export type TextSize = 'small' | 'medium' | 'large';

export interface RadioGroupExperimentalTokens extends LayoutTokens, IBorderTokens, IColorTokens {
  small?: RadioGroupExperimentalTokens;
  medium?: RadioGroupExperimentalTokens;
  large?: RadioGroupExperimentalTokens;
}

export interface RadioGroupExperimentalProps {
  textSize?: TextSize;
  text?: string;
}

export interface RadioGroupExperimentalSlotProps {
  root: ViewProps;
  text: TextProps;
}

export interface RadioGroupExperimentalType {
  props: RadioGroupExperimentalProps;
  tokens: RadioGroupExperimentalTokens;
  slotProps: RadioGroupExperimentalSlotProps;
}
