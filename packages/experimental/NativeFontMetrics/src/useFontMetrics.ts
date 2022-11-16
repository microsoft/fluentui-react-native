import { useMemo } from 'react';
import { NativeEventEmitter, Platform } from 'react-native';
import { useSubscription } from 'use-subscription';
import { fontMetrics } from './fontMetrics';
import NativeFontMetrics from './NativeFontMetrics';
import { ScaleFactors } from './NativeFontMetrics.types';

const eventEmitter = new NativeEventEmitter(NativeFontMetrics as any);

export function useFontMetricsScaleFactors(): ScaleFactors {
  if (Platform.OS !== 'ios') {
    console.warn('NativeFontMetrics is only available on iOS');
    return {};
  }

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
