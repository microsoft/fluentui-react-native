import { OfficeThemingModule } from './officeThemingModule';
import { NativeEventEmitter, NativeModules } from 'react-native';
import { enableNativeModule } from './enableNativeModule';
import { fallbackOfficeModule } from './fallbackOfficeModule';

declare module 'react-native' {
  interface NativeModulesStatic {
    Theming: OfficeThemingModule & EventSubscriptionVendor;
  }
}

export function getThemingModule(): [OfficeThemingModule, NativeEventEmitter | undefined] {
  // if the native module exists and we are cleared to use it return the module + an emitter for it
  if (enableNativeModule() && NativeModules && NativeModules.Theming) {
    return [NativeModules.Theming, new NativeEventEmitter(NativeModules.Theming)];
  }

  // otherwise use the fallback module
  return [fallbackOfficeModule, undefined];
}
