import { NativeEventEmitter } from 'react-native';
import NativeAppearanceAdditions from './NativeAppearanceAdditions.ios';
import {
  HorizontalSizeClassKey,
  AppearanceAdditions,
  SizeClass,
  UserInterfaceLevel,
  UserInterfaceLevelKey,
} from './NativeAppearanceAdditions.types';

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

export const appearanceAdditions = new AppearanceAdditionsImpl() as AppearanceAdditions;
