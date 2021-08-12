import { ColorValue } from 'react-native';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';
import { tokenBuilder } from './tokenBuilder';

export interface IShadowTokens {
  shadowColor?: ColorValue;
  shadowOffset?: {
    width: number;
    height: number;
  };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number; // for android shadows
}

export const shadowTokens: IOperationSet<IShadowTokens, ITheme> = [
  { source: 'shadowColor' },
  { source: 'shadowOffset' },
  { source: 'shadowOpacity' },
  { source: 'shadowRadius' },
  { source: 'elevation' },
];

export const shadowStyles = tokenBuilder<IShadowTokens>('shadowColor', 'shadowOffset', 'shadowOpacity', 'shadowRadius', 'elevation');
