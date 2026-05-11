import type { TextStyle } from './NativeFontMetrics.types';

const NativeFontMetrics = {
  addListener: (_: string) => undefined,

  removeListeners: (_: number) => undefined,
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
