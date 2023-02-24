import { useMemo } from 'react';
import { NativeEventEmitter } from 'react-native';

import { useSubscription } from 'use-subscription';

import { fontMetrics } from './fontMetrics';
import NativeFontMetrics from './NativeFontMetrics';
import type { ScaleFactors } from './NativeFontMetrics.types';

const eventEmitter = NativeFontMetrics ? new NativeEventEmitter(NativeFontMetrics as any) : undefined;

export function useFontMetricsScaleFactors(): ScaleFactors {
  if (!eventEmitter) {
    return {};
  }

  // Early return on eventEmitter will either always or never return within a single instance
  // eslint-disable-next-line react-hooks/rules-of-hooks
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

  // Early return on eventEmitter will either always or never return within a single instance
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useSubscription(subscription);
}
