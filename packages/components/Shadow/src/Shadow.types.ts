import { ViewProps } from 'react-native';
import { IBorderTokens, IColorTokens, LayoutTokens } from '@fluentui-react-native/tokens';

export const shadow = 'Shadow';

export type ShadowDepth = '2' | '4' | '8' | '16' | '28' | '64';

export interface ShadowTokens extends LayoutTokens, IBorderTokens, IColorTokens {}

export interface ShadowProps extends ViewProps, IBorderTokens {
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
