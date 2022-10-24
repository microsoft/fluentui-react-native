import { NativeModules } from 'react-native';
export const NativeFontMetrics = NativeModules.FRNFontMetrics;

interface NativeFontMetricsInterface {
  calculateScaleFactorForStyle(style: string, callback: (number) => void);
  scaleFactorForStyle(style: string): number;
}
export default NativeFontMetrics as NativeFontMetricsInterface;
