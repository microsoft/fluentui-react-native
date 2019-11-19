import { createThemingModuleHelper } from './ThemingModuleHelpers';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { IOfficeThemingModule } from '.';

declare module 'react-native' {
  interface NativeModulesStatic {
    Theming: IOfficeThemingModule & EventSubscriptionVendor;
  }
}

export const ThemingModuleHelper = createThemingModuleHelper(NativeModules.Theming, new NativeEventEmitter(NativeModules.Theming));
