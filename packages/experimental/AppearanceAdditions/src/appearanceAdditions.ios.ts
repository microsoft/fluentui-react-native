import { NativeEventEmitter } from 'react-native';
import NativeAppearanceAdditions from './NativeAppearanceAdditions.ios';
import type { AppearanceAdditions, SizeClass, UserInterfaceLevel } from './NativeAppearanceAdditions.types';
import { HorizontalSizeClassKey, UserInterfaceLevelKey } from './NativeAppearanceAdditions.types';
import { memoize } from '@fluentui-react-native/framework';

class AppearanceAdditionsImpl implements AppearanceAdditions {
  _horizontalSizeClass: SizeClass;
  _userInterfaceLevel: UserInterfaceLevel;

  get horizontalSizeClass(): SizeClass {
    return this._horizontalSizeClass;
  }

  get userInterfaceLevel(): UserInterfaceLevel {
    return this._userInterfaceLevel;
  }

  constructor() {
    const eventEmitter = new NativeEventEmitter(NativeAppearanceAdditions as any);
    eventEmitter.addListener('appearanceChanged', (newValue) => {
      this._horizontalSizeClass = newValue[HorizontalSizeClassKey];
      this._userInterfaceLevel = newValue[UserInterfaceLevelKey];
    });
  }
}

function getAppearanceAdditionsWorker() {
  return new AppearanceAdditionsImpl() as AppearanceAdditions;
}

export const appearanceAdditions = memoize(getAppearanceAdditionsWorker);
