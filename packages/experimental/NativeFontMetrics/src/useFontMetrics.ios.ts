import { useMemo } from 'react';
import { NativeEventEmitter } from 'react-native';
import { useSubscription } from 'use-subscription';
import NativeFontMetrics, { ScaleFactors } from './NativeFontMetrics';

const eventEmitter = new NativeEventEmitter(NativeFontMetrics as any);

export function useFontMetrics(): ScaleFactors {
  const subscription = useMemo(
    () => ({
      getCurrentValue: () => NativeFontMetrics.allScaleFactors(),
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
