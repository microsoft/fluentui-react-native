import { NativeEventEmitter } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';

import NativeAppearanceAdditions from './NativeAppearanceAdditions';
import type { AppearanceAdditions, SizeClass, UserInterfaceLevel, AccessibilityContrastOption } from './NativeAppearanceAdditions.types';
import { HorizontalSizeClassKey, UserInterfaceLevelKey, AccessibilityContrastOptionKey } from './NativeAppearanceAdditions.types';

class AppearanceAdditionsImpl implements AppearanceAdditions {
  _horizontalSizeClass: SizeClass;
  _userInterfaceLevel: UserInterfaceLevel;
  _accessibilityContrastOption: AccessibilityContrastOption;

  constructor() {
    this._horizontalSizeClass = NativeAppearanceAdditions.horizontalSizeClass(null);
    this._userInterfaceLevel = NativeAppearanceAdditions.userInterfaceLevel(null);
    this._accessibilityContrastOption = NativeAppearanceAdditions.accessibilityContrastOption();

    const eventEmitter = new NativeEventEmitter(NativeAppearanceAdditions as any);
    eventEmitter.addListener('appearanceChanged', (newValue) => {
      this._horizontalSizeClass = newValue[HorizontalSizeClassKey];
      this._userInterfaceLevel = newValue[UserInterfaceLevelKey];
      this._accessibilityContrastOption = newValue[AccessibilityContrastOptionKey];
    });
  }

  horizontalSizeClass(viewTag = null): SizeClass {
    if (!viewTag) {
      return this._horizontalSizeClass;
    }
    return NativeAppearanceAdditions.horizontalSizeClass(viewTag);
  }

  userInterfaceLevel(viewTag = null): UserInterfaceLevel {
    if (!viewTag) {
      return this._userInterfaceLevel;
    }
    return NativeAppearanceAdditions.userInterfaceLevel(viewTag);
  }

  accessibilityContrastOption(): AccessibilityContrastOption {
    return this._accessibilityContrastOption;
  }
}

function getAppearanceAdditionsWorker() {
  return new AppearanceAdditionsImpl() as AppearanceAdditions;
}

export const appearanceAdditions = memoize(getAppearanceAdditionsWorker);
