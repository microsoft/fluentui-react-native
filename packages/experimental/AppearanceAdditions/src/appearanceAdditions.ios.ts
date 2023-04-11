import { NativeEventEmitter } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';

import NativeAppearanceAdditions from './NativeAppearanceAdditions';
import type { AppearanceAdditions, SizeClass, UserInterfaceLevel, AccessibilityContrastOption } from './NativeAppearanceAdditions.types';
import { HorizontalSizeClassKey, UserInterfaceLevelKey, AccessibilityContrastOptionKey } from './NativeAppearanceAdditions.types';

class AppearanceAdditionsImpl implements AppearanceAdditions {
  _horizontalSizeClass: SizeClass;
  _userInterfaceLevel: UserInterfaceLevel;
  _accessibilityContrastOption: AccessibilityContrastOption;

  get horizontalSizeClass(): SizeClass {
    return this._horizontalSizeClass;
  }

  get userInterfaceLevel(): UserInterfaceLevel {
    return this._userInterfaceLevel;
  }

  get accessibilityContrastOption(): AccessibilityContrastOption {
    return this._accessibilityContrastOption;
  }

  constructor(reactTag: number = null) {
    NativeAppearanceAdditions.initializeTraitCollection(reactTag);

    this._horizontalSizeClass = NativeAppearanceAdditions.horizontalSizeClass();
    this._userInterfaceLevel = NativeAppearanceAdditions.userInterfaceLevel();
    this._accessibilityContrastOption = NativeAppearanceAdditions.accessibilityContrastOption();

    const eventEmitter = new NativeEventEmitter(NativeAppearanceAdditions as any);
    eventEmitter.addListener('appearanceChanged', (newValue) => {
      this._horizontalSizeClass = newValue[HorizontalSizeClassKey] ?? this._horizontalSizeClass;
      this._userInterfaceLevel = newValue[UserInterfaceLevelKey] ?? this._userInterfaceLevel;
      this._accessibilityContrastOption = newValue[AccessibilityContrastOptionKey] ?? this._accessibilityContrastOption;
    });
  }
}

function getAppearanceAdditionsWorker(reactTag: number) {
  return new AppearanceAdditionsImpl(reactTag) as AppearanceAdditions;
}

export const appearanceAdditions = memoize(getAppearanceAdditionsWorker);
