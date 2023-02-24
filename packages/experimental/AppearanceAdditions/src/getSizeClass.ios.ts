import { useMemo } from 'react';
import { NativeEventEmitter } from 'react-native';

import { useSubscription } from 'use-subscription';

import { appearanceAdditions } from './appearanceAdditions';
import NativeAppearanceAdditions from './NativeAppearanceAdditions';
import type { SizeClass } from './NativeAppearanceAdditions.types';

const eventEmitter = NativeAppearanceAdditions ? new NativeEventEmitter(NativeAppearanceAdditions as any) : undefined;

export function useHorizontalSizeClass(): SizeClass {
  if (!eventEmitter) {
    return 'regular';
  }

  // Early return on eventEmitter will either always or never return within a single instance
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const subscription = useMemo(
    () => ({
      getCurrentValue: () => appearanceAdditions().horizontalSizeClass,
      subscribe: (callback) => {
        const appearanceSubscription = eventEmitter.addListener('appearanceChanged', callback);
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
