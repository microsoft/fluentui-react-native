import { IThemingModule } from './ThemingModule.types';
import { makeThemingModuleHelper } from './ThemingModuleHelpers';
import { NativeEventEmitter, NativeModules } from 'react-native';

declare module 'react-native' {
  interface NativeModulesStatic {
    Theming: IThemingModule & EventSubscriptionVendor;
  }
}

export const ThemingModuleHelper = makeThemingModuleHelper(new NativeEventEmitter(NativeModules.Theming), NativeModules.Theming);
