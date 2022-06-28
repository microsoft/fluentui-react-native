import { ViewProps } from 'react-native';

export type ShadowDepth = '2' | '4' | '8' | '16' | '28' | '64';

export interface ShadowProps extends ViewProps {
  depth?: ShadowDepth;
}
