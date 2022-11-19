import { useMemo } from 'react';
import { NativeEventEmitter } from 'react-native';
import { useSubscription } from 'use-subscription';
import { fontMetrics } from './fontMetrics';
import NativeFontMetrics from './NativeFontMetrics';
import { ScaleFactors } from './NativeFontMetrics.types';

const eventEmitter = new NativeEventEmitter(NativeFontMetrics as any);

export function useFontMetricsScaleFactors(): ScaleFactors {
  const subscription = useMemo(
    () => ({
      getCurrentValue: () => fontMetrics.scaleFactors,
      subscribe: (callback) => {
        const appearanceSubscription = eventEmitter.addListener('onFontMetricsChanged', callback);
        return () => {
          appearanceSubscription.remove();
        };
      },
    }),
    [],
  );

  return useSubscription(subscription);
}
