import { ScaleFactors } from './NativeFontMetrics.types';

export function useFontMetricsScaleFactors(): ScaleFactors {
  console.warn('NativeFontMetrics is only available on iOS');
  return {};
}
