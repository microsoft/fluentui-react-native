import { ScaleFactors, TextStyle } from './NativeFontMetrics.types';

interface NativeFontMetricsInterface {
  currentScaleFactors(): ScaleFactors;
  scaleFactorForStyle(style: TextStyle): number;
}

const NativeFontMetrics: NativeFontMetricsInterface = {
  currentScaleFactors: () => {
    console.warn('NativeFontMetrics is only available on iOS');
    return {};
  },
  scaleFactorForStyle: (_: TextStyle) => {
    console.warn('NativeFontMetrics is only available on iOS');
    return 1;
  },
};

export default NativeFontMetrics;
