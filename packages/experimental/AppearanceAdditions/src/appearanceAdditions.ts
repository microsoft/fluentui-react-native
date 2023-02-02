import { memoize } from '@fluentui-react-native/framework';
import type { AppearanceAdditions } from './NativeAppearanceAdditions.types';

// Default values for non-iOS clients.
function getAppearanceAdditionsWorker() {
  return {
    horizontalSizeClass: 'regular',
    userInterfaceLevel: 'base',
  } as AppearanceAdditions;
}

export const appearanceAdditions = memoize(getAppearanceAdditionsWorker);
