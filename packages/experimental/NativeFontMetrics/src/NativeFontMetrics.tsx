import { NativeModules } from 'react-native';

export const NativeFontMetrics = NativeModules.FRNFontMetrics;

export type TextStyle =
  | 'caption2'
  | 'caption1'
  | 'footnote'
  | 'subheadline'
  | 'callout'
  | 'body'
  | 'headline'
  | 'title3'
  | 'title2'
  | 'title1'
  | 'largeTitle';

export type ScaleFactors = { [K in TextStyle]: number | undefined };

interface NativeFontMetricsInterface {
  allScaleFactors(): ScaleFactors;
  calculateScaleFactorForStyle(style: TextStyle, callback: (number) => void);
  scaleFactorForStyle(style: TextStyle): number;
}
export default NativeFontMetrics as NativeFontMetricsInterface;
