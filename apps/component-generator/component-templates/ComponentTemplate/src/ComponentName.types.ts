import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/text';
import { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const componentName = 'ComponentName';
/**
 * This type is an example. Feel free to remove it.
 */
export type TextSize = 'small' | 'medium' | 'large';

export interface ComponentNameTokens extends LayoutTokens, IBorderTokens, IColorTokens {
  small?: ComponentNameTokens;
  medium?: ComponentNameTokens;
  large?: ComponentNameTokens;
}

export interface ComponentNameProps {
  textSize?: TextSize;
  text?: string;
}

export interface ComponentNameSlotProps {
  root: ViewProps;
  text: TextProps;
}

export interface ComponentNameType {
  props: ComponentNameProps;
  tokens: ComponentNameTokens;
  slotProps: ComponentNameSlotProps;
}
