import { useMemo } from 'react';
import { NativeEventEmitter } from 'react-native';
import { useSubscription } from 'use-subscription';
import { appearanceAdditions } from './appearanceAdditions';

import NativeAppearanceAdditions from './NativeAppearanceAdditions';
import { SizeClass } from './NativeAppearanceAdditions.types';

const eventEmitter = NativeAppearanceAdditions ? new NativeEventEmitter(NativeAppearanceAdditions as any) : undefined;

export function useHorizontalSizeClass(): SizeClass {
  if (!eventEmitter) {
    return 'regular';
  }

  const subscription = useMemo(
    () => ({
      getCurrentValue: () => appearanceAdditions.horizontalSizeClass,
      subscribe: (callback) => {
        const appearanceSubscription = eventEmitter.addListener('appearanceChanged', callback);
        return () => {
          appearanceSubscription.remove();
        };
      },
    }),
    [],
  );

  return useSubscription(subscription);
}
