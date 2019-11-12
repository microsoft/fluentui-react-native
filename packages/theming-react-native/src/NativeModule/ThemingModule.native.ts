import { makeOfficeThemingModuleHelper } from './ThemingModuleHelpers';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { IOfficeThemingModule } from '.';

declare module 'react-native' {
  interface NativeModulesStatic {
    Theming: IOfficeThemingModule & EventSubscriptionVendor;
  }
}

export const ThemingModuleHelper = makeOfficeThemingModuleHelper(new NativeEventEmitter(NativeModules.Theming), NativeModules.Theming);
