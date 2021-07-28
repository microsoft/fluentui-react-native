import { IBorderTokens } from '@fluentui-react-native/tokens';
import { ViewStyle, ViewProps, ColorValue } from 'react-native';

export type ShadowDepth = '2' | '4' | '8' | '16' | '28' | '64';

export interface ShadowTokens extends IBorderTokens {
  ambient?: ViewStyle;
  key?: ViewStyle;
  color?: ColorValue;
  backgroundColor?: ColorValue;
  innerShadowSlot?: React.ComponentType<ViewProps>;
  depth2?: ShadowTokens;
  depth4?: ShadowTokens;
  depth8?: ShadowTokens;
  depth16?: ShadowTokens;
  depth28?: ShadowTokens;
  depth64?: ShadowTokens;
}

export interface ShadowProps extends ViewProps, ViewStyle, IBorderTokens {
  depth?: ShadowDepth;
}
