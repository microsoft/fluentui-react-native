import { NativeEventEmitter } from 'react-native';

import { memoize } from '@fluentui-react-native/framework';

import NativeAppearanceAdditions from './NativeAppearanceAdditions';
import type { AppearanceAdditions, SizeClass, UserInterfaceLevel, AccessibilityContrastOption } from './NativeAppearanceAdditions.types';
import {
  HorizontalSizeClassKey,
  UserInterfaceLevelKey,
  AccessibilityContrastOptionKey,
  RootTagKey,
} from './NativeAppearanceAdditions.types';

class AppearanceAdditionsImpl implements AppearanceAdditions {
  _rootTagHorizontalSizeClassMap: { [key: number]: SizeClass } = {};
  _rootTagUserInterfaceLevelMap: { [key: number]: UserInterfaceLevel } = {};
  _rootTagAccessibilityContrastOptionMap: { [key: number]: AccessibilityContrastOption } = {};

  constructor() {
    this._rootTagHorizontalSizeClassMap = NativeAppearanceAdditions.horizontalSizeClass();
    this._rootTagUserInterfaceLevelMap = NativeAppearanceAdditions.userInterfaceLevel();
    this._rootTagAccessibilityContrastOptionMap = NativeAppearanceAdditions.accessibilityContrastOption();

    const eventEmitter = new NativeEventEmitter(NativeAppearanceAdditions as any);
    eventEmitter.addListener('appearanceChanged', (newValue) => {
      const rootTag = newValue[RootTagKey];

      this._rootTagHorizontalSizeClassMap[rootTag] = newValue[HorizontalSizeClassKey];
      this._rootTagUserInterfaceLevelMap[rootTag] = newValue[UserInterfaceLevelKey];
      this._rootTagAccessibilityContrastOptionMap[rootTag] = newValue[AccessibilityContrastOptionKey];
    });
  }

  horizontalSizeClassForRootTag(rootTag: number): SizeClass {
    return this._rootTagHorizontalSizeClassMap[rootTag];
  }
  userInterfaceLevelForRootTag(rootTag: number): UserInterfaceLevel {
    return this._rootTagUserInterfaceLevelMap[rootTag];
  }
  accessibilityContrastOptionForRootTag(rootTag: number): AccessibilityContrastOption {
    return this._rootTagAccessibilityContrastOptionMap[rootTag];
  }
}

function getAppearanceAdditionsWorker() {
  return new AppearanceAdditionsImpl() as AppearanceAdditions;
}

export const appearanceAdditions = memoize(getAppearanceAdditionsWorker);
