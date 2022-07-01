import { ViewProps } from 'react-native';

export const shadowName = 'Shadow';

export type ShadowDepth =
  | 'shadow2'
  | 'shadow4'
  | 'shadow8'
  | 'shadow16'
  | 'shadow28'
  | 'shadow64'
  | 'shadow2brand'
  | 'shadow4brand'
  | 'shadow8brand'
  | 'shadow16brand'
  | 'shadow28brand'
  | 'shadow64brand';

export interface ShadowProps extends ViewProps {
  depth?: ShadowDepth;
}

export interface ShadowTokens {}
