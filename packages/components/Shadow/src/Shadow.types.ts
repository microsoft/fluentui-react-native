import { ViewProps } from 'react-native';
import { TextProps } from '@fluentui-react-native/experimental-text';
import { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const shadow = 'Shadow';

export type ShadowDepth = '2' | '4' | '8' | '16' | '28' | '64';

export interface ShadowTokens extends LayoutTokens, IBorderTokens, IColorTokens {
  small?: ShadowTokens;
  medium?: ShadowTokens;
  large?: ShadowTokens;
}

export interface ShadowProps {
  depth?: ShadowDepth;
}

export interface ShadowProps extends ViewProps, ViewStyle, IBorderTokens {
  depth?: ShadowDepth;
}

export interface ShadowSlotProps {
  root: ViewProps;
}

export interface ShadowType {
  props: ShadowProps;
  tokens: ShadowTokens;
  slotProps: ShadowSlotProps;
}
