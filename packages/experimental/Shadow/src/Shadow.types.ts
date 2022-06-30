import { ViewProps } from 'react-native';

export const shadowName = 'Shadow';

export type ShadowDepth = '2' | '4' | '8' | '16' | '28' | '64';

export interface ShadowProps extends ViewProps {
  depth?: ShadowDepth;
}

export interface ShadowTokens {}
