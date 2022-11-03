import { ScaleFactors, TextStyle } from './NativeFontMetrics.types';

interface NativeFontMetricsInterface {
  allScaleFactors(): ScaleFactors;
  scaleFactorForStyle(style: TextStyle): number;
}

const NativeFontMetrics: NativeFontMetricsInterface = {
  allScaleFactors: () => {
    console.warn('NativeFontMetrics is only available on iOS');
    return {};
  },
  scaleFactorForStyle: (_: TextStyle) => {
    console.warn('NativeFontMetrics is only available on iOS');
    return 1;
  },
};

export default NativeFontMetrics;
