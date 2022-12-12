import { NativeModules } from 'react-native';
import { ScaleFactors, TextStyle } from './NativeFontMetrics.types';

export const NativeFontMetrics = NativeModules.FRNFontMetrics;

interface NativeFontMetricsInterface {
  currentScaleFactors(): ScaleFactors;
  scaleFactorForStyle(style: TextStyle): number;
}

export default NativeFontMetrics as NativeFontMetricsInterface;
