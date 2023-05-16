import { memoize } from '@fluentui-react-native/framework';

import type { AppearanceAdditions } from './NativeAppearanceAdditions.types';

// Default values for non-iOS clients.
function getAppearanceAdditionsWorker(_reactTag: number) {
  return {
    horizontalSizeClass: 'regular',
    userInterfaceLevel: 'base',
    accessibilityContrastOption: 'normal',
  } as AppearanceAdditions;
}

export const appearanceAdditions = memoize(getAppearanceAdditionsWorker);
